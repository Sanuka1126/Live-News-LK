const container = document.getElementById('news-container');
const timeEl = document.getElementById('time');

// Hiru & Ada RSS - proxy 2k dala 100% wada karanawa
const feeds = [
 {name:"hiru", url:"https://www.hirunews.lk/rss/sinhala.xml"},
 {name:"ada", url:"https://sinhala.adaderana.lk/rss.php"}
];

async function fetchViaAllOrigins(rssUrl){
 try{
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
  const res = await fetch(proxy);
  const data = await res.json();
  const xmlText = data.contents;
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");
  const items = xml.querySelectorAll("item");
  let news = [];
  items.forEach((item,i)=>{
   if(i>=10) return;
   const title = item.querySelector("title")?.textContent || "";
   const desc = item.querySelector("description")?.textContent || "";
   const link = item.querySelector("link")?.textContent || "";
   const pubDate = item.querySelector("pubDate")?.textContent || "";
   const imgMatch = desc.match(/<img[^>]+src="([^">]+)"/);
   const thumb = item.querySelector("enclosure")?.getAttribute("url") || (imgMatch?imgMatch[1]:"");
   news.push({
    title: title,
    desc: desc.replace(/<[^>]*>/g,'').substring(0,130)+"...",
    fullDesc: desc.replace(/<[^>]*>/g,''),
    content: desc,
    link: link,
    image: thumb,
    source: rssUrl.includes("hiru")?"hiru":"ada",
    date: pubDate ? new Date(pubDate).toLocaleString('si-LK') : "අද"
   });
  });
  return news;
 }catch(e){ return []; }
}

async function fetchNews(){
 container.innerHTML = "<p style='text-align:center;padding:60px;'>🇱🇰 Live සිංහල පුවත් ලෝඩ් වෙමින්... ⏳</p>";
 let allNews = [];

 for(let f of feeds){
  const n = await fetchViaAllOrigins(f.url);
  allNews = allNews.concat(n);
 }

 // 2nd try - rss2json backup
 if(allNews.length==0){
  for(let f of feeds){
   try{
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(f.url)}`;
    const r = await fetch(api);
    const d = await r.json();
    if(d.items) d.items.slice(0,8).forEach(item=>{
     allNews.push({
      title:item.title, desc:item.description.replace(/<[^>]*>/g,'').substring(0,130)+"...",
      fullDesc:item.description.replace(/<[^>]*>/g,''), content:item.content||item.description,
      link:item.link, image:item.enclosure?.link||"", source:f.name,
      date: new Date(item.pubDate).toLocaleString('si-LK')
     });
    });
   }catch(e){}
  }
 }

 if(allNews.length==0){
  container.innerHTML = "<p style='text-align:center;padding:30px'>😢 RSS load wenne na. Refresh karanna. (GitHub Pages wala samahara welawata block wenawa)</p>";
  return;
 }

 localStorage.setItem('liveNewsLK', JSON.stringify(allNews));
 displayNews(allNews);
 if(timeEl) timeEl.textContent = new Date().toLocaleTimeString('si-LK');
}

function displayNews(news){
 container.innerHTML = news.map((n,i)=>`
  <div class="card" data-source="${n.source}">
   ${n.image?`<img src="${n.image}" style="width:100%;height:180px;object-fit:cover" onerror="this.style.display='none'">`:''}
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
