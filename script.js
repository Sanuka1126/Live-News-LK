const container = document.getElementById('news-container');
const timeEl = document.getElementById('time');

const feeds = [
 {name:"hiru", url:"https://www.hirunews.lk/rss/sinhala.xml"},
 {name:"ada", url:"https://sinhala.adaderana.lk/rss.php"}
];

async function fetchNews(){
 container.innerHTML = "<p style='text-align:center;padding:50px;'>🇱🇰 පුවත් ලෝඩ් වෙමින්... ⏳</p>";
 let allNews = [];
 for(let feed of feeds){
  try{
   const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
   const res = await fetch(api);
   const data = await res.json();
   if(data.items){
    data.items.slice(0,15).forEach(item=>{
     allNews.push({
      title: item.title,
      desc: item.description.replace(/<[^>]*>/g,'').substring(0,120)+"...",
      fullDesc: item.description,
      content: item.content || item.description,
      link: item.link,
      image: item.enclosure?.link || item.thumbnail || "",
      source: feed.name,
      date: new Date(item.pubDate).toLocaleString('si-LK')
     });
    });
   }
  }catch(e){}
 }
 if(allNews.length==0){
  allNews = [
   {title:"අද දින ප්‍රධාන පුවත් - ලංකාවේ උණුසුම් පුවත්", desc:"අද දින සිදු වූ විශේෂ සිදුවීම්...", fullDesc:"අද දිනයේ සිදු වූ සියලුම විශේෂ සිදුවීම් මෙහි ඇතුලත් වේ. ලංකාවේ දේශපාලන, ක්‍රීඩා, තාක්ෂණික සියලු පුවත්...", content:"Full news content here...", link:"#", source:"hiru", date:"අද", image:""},
   {title:"ක්‍රිකට්: ශ්‍රී ලංකා කණ්ඩායම ජයග්‍රහණය කරයි!", desc:"අද තරගයේ විශේෂ අවස්ථා...", fullDesc:"ශ්‍රී ලංකා කණ්ඩායම අද තරගය ජයග්‍රහණය කිරීමට සමත් විය. අවසන් ඕවරයේදී විශිෂ්ට පන්දු යැවීම...", content:"Full cricket news...", link:"#", source:"ada", date:"අද", image:""}
  ];
 }
 localStorage.setItem('liveNewsLK', JSON.stringify(allNews));
 displayNews(allNews);
 if(timeEl) timeEl.textContent = new Date().toLocaleTimeString('si-LK');
}

function displayNews(news){
 container.innerHTML = news.map((n,i)=>`
  <div class="card" data-source="${n.source}">
   ${n.image ? `<img src="${n.image}" style="width:100%;height:180px;object-fit:cover">` : ''}
   <div class="card-content">
    <h3>${n.title}</h3>
    <p>${n.desc}</p>
    <div class="meta"><span>📰 ${n.source.toUpperCase()}</span><span>${n.date}</span></div>
    <a href="news.html?id=${i}" class="read-btn">වැඩිදුර කියවන්න →</a>
   </div>
  </div>
 `).join('');
}

function loadNews(cat){
 document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
 event.target.classList.add('active');
 document.querySelectorAll('.card').forEach(c=>{
  c.style.display = (cat==='all' || c.dataset.source===cat) ? 'block' : 'none';
 });
}
fetchNews();
setInterval(fetchNews, 300000);
