const container = document.getElementById('news-container');
const timeEl = document.getElementById('time');

async function fetchNews(){
 try{
  container.innerHTML = "<p style='text-align:center;padding:50px;'>🇱🇰 පුවත් ලෝඩ් වෙමින්... ⏳</p>";
  
  // 1. Local JSON eken gannawa (100% wada)
  let allNews = [];
  try{
   const localRes = await fetch('./news-data.json?v='+Date.now());
   if(localRes.ok){
    allNews = await localRes.json();
   }
  }catch(e){}

  // 2. Live RSS try karanawa (wada nam add karanawa)
  try{
   const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent('https://www.hirunews.lk/rss/sinhala.xml')}`;
   const res = await fetch(proxy);
   const data = await res.json();
   const xmlText = data.contents;
   const parser = new DOMParser();
   const xml = parser.parseFromString(xmlText, "text/xml");
   const items = xml.querySelectorAll("item");
   items.forEach((item,i)=>{
    if(i>=8) return;
    const title = item.querySelector("title")?.textContent || "";
    if(!title) return;
    const desc = item.querySelector("description")?.textContent || "";
    const cleanDesc = desc.replace(/<[^>]*>/g,'');
    allNews.unshift({
     title: title,
     desc: cleanDesc.substring(0,120)+"...",
     fullDesc: cleanDesc,
     content: cleanDesc,
     link: item.querySelector("link")?.textContent || "#",
     image: item.querySelector("enclosure")?.getAttribute("url") || "https://images.unsplash.com/photo-1504711434969-e33886168f5c",
     source: "hiru",
     date: "Live - දැන්"
    });
   });
  }catch(e){ console.log("Live RSS fail, local ok"); }

  localStorage.setItem('liveNewsLK', JSON.stringify(allNews));
  displayNews(allNews);
  if(timeEl) timeEl.textContent = new Date().toLocaleTimeString('si-LK');
 }catch(err){
  container.innerHTML = "<p style='text-align:center'>Error loading news</p>";
 }
}

function displayNews(news){
 container.innerHTML = news.map((n,i)=>`
  <div class="card" data-source="${n.source}">
   <img src="${n.image}" style="width:100%;height:180px;object-fit:cover" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c'">
   <div class="card-content">
    <h3>${n.title}</h3>
    <p>${n.desc}</p>
    <div class="meta"><span>📰 ${n.source.toUpperCase()}</span><span>${n.date}</span></div>
    <a href="news.html?id=${i}" class="read-btn" style="display:inline-block;margin-top:12px;background:#b71c1c;color:#fff;padding:8px 16px;border-radius:20px;text-decoration:none;font-weight:bold;">වැඩිදුර කියවන්න →</a>
   </div>
  </div>
 `).join('');
}

function loadNews(cat){
 document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
 event.target.classList.add('active');
 document.querySelectorAll('.card').forEach(c=>{
  c.style.display = (cat==='all' || c.dataset.source===cat) ? 'block':'none';
 });
}

fetchNews();
setInterval(fetchNews, 300000);
