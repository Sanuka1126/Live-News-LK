const container = document.getElementById('news-container');
const timeEl = document.getElementById('time');

// Sinhala News RSS Feeds
const feeds = [
 {name:"hiru", url:"https://www.hirunews.lk/rss/sinhala.xml"},
 {name:"ada", url:"https://sinhala.adaderana.lk/rss.php"},
 {name:"lankadeepa", url:"http://www.lankadeepa.lk/rss/sinhala.rss"}
];

async function fetchNews(){
 try{
  container.innerHTML = "<p style='text-align:center;padding:50px;'>🇱🇰 සිංහල පුවත් ලෝඩ් වෙමින්... ⏳</p>";
  let allNews = [];

  for(let feed of feeds){
   try{
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
    const res = await fetch(api);
    const data = await res.json();
    if(data.items){
     data.items.slice(0,10).forEach(item=>{
      allNews.push({
       title: item.title,
       desc: item.description.replace(/<[^>]*>/g,'').substring(0,120)+"...",
       link: item.link,
       source: feed.name,
       date: new Date(item.pubDate).toLocaleDateString('si-LK')
      });
     });
    }
   }catch(e){console.log(feed.name+" error")}
  }

  // Fallback if API fails
  if(allNews.length==0){
   allNews = [
    {title:"අද දිනයේ ප්‍රධාන පුවත් - ලංකාවේ උණුසුම් පුවත්", desc:"අද දිනයේ සිදු වූ විශේෂ සිදුවීම්...", link:"#", source:"hiru", date:"අද"},
    {title:"ක්‍රිකට්: ශ්‍රී ලංකා කණ්ඩායම ජයග්‍රහණය කරයි!", desc:"අද තරගයේ විශේෂ අවස්ථා...", link:"#", source:"ada", date:"අද"},
   ];
  }

  displayNews(allNews);
  timeEl.textContent = new Date().toLocaleTimeString('si-LK');
 }catch(err){
  container.innerHTML = "<p>පුවත් ලෝඩ් කිරීමට නොහැක. Refresh කරන්න.</p>";
 }
}

function displayNews(news){
 container.innerHTML = news.map(n=>`
  <div class="card" data-source="${n.source}">
   <div class="card-content">
    <h3>${n.title}</h3>
    <p>${n.desc}</p>
    <div class="meta"><span>📰 ${n.source.toUpperCase()}</span><span>${n.date}</span></div>
    <a href="${n.link}" target="_blank">වැඩිදුර කියවන්න →</a>
   </div>
  </div>
 `).join('');
}

function loadNews(cat){
 document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
 event.target.classList.add('active');
 const cards = document.querySelectorAll('.card');
 if(cat==='all') cards.forEach(c=>c.style.display='block');
 else cards.forEach(c=>c.style.display=c.dataset.source===cat?'block':'none');
}

fetchNews();
// Auto refresh every 5 min
setInterval(fetchNews, 300000);
