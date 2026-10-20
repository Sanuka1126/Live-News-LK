const container = document.getElementById('news-container');
const timeEl = document.getElementById('time');

const feeds = [
  {name:"hiru", url:"https://www.hirunews.lk/rss/sinhala.xml"},
  {name:"ada", url:"https://sinhala.adaderana.lk/rss.php"},
  {name:"lankadeepa", url:"https://www.lankadeepa.lk/rss/sinhala.rss"}
];

async function fetchLiveAPI(){
  try{
    container.innerHTML = "<p style='text-align:center;padding:60px;'>🔴 LIVE පුවත් API eken gannawa... ⏳</p>";
    let allNews = [];

    for(let f of feeds){
      try{
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(f.url)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        if(data.items){
          data.items.slice(0,8).forEach(item=>{
            const clean = (item.description||"").replace(/<[^>]*>/g,'');
            if(!item.title) return;
            allNews.push({
              title: item.title,
              desc: clean.substring(0,120)+"...",
              fullDesc: clean,
              content: clean,
              link: item.link,
              image: item.enclosure?.link || item.thumbnail || "",
              source: f.name,
              date: new Date().toLocaleTimeString('si-LK') + " - LIVE"
            });
          });
        }
      }catch(e){}
    }

    // Backup - news-data.json eken
    if(allNews.length < 3){
      try{
        const local = await fetch('./news-data.json?v='+Date.now());
        if(local.ok){
          const localData = await local.json();
          allNews = allNews.concat(localData);
        }
      }catch(e){}
    }

    if(allNews.length==0){
      container.innerHTML = "<p style='text-align:center;padding:40px'>API limit. Min 2k refresh karanna bn</p>";
      return;
    }

    localStorage.setItem('liveNewsLK', JSON.stringify(allNews));
    displayNews(allNews);
    if(timeEl) timeEl.textContent = "LIVE 🔴 " + new Date().toLocaleTimeString('si-LK');
    
  }catch(err){
    container.innerHTML = "<p style='text-align:center'>Error - refresh karanna</p>";
  }
}

function displayNews(news){
  container.innerHTML = news.map((n,i)=>`
    <div class="card" data-source="${n.source}">
      ${n.image ? `<img src="${n.image}" style="width:100%;height:180px;object-fit:cover" onerror="this.style.display='none'">` : ''}
      <div class="card-content">
        <h3>${n.title}</h3>
        <p>${n.desc}</p>
        <div class="meta"><span>📰 ${n.source.toUpperCase()}</span><span>${n.date}</span></div>
        <a href="news.html?id=${i}" style="display:inline-block;margin-top:12px;background:#b71c1c;color:#fff;padding:8px 16px;border-radius:20px;text-decoration:none;font-weight:bold;">වැඩිදුර කියවන්න →</a>
      </div>
    </div>
  `).join('');
}

function loadNews(cat){
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
  if(event) event.target.classList.add('active');
  document.querySelectorAll('.card').forEach(c=>{
    c.style.display = (cat==='all' || c.dataset.source===cat) ? 'block':'none';
  });
}

fetchLiveAPI();
setInterval(fetchLiveAPI, 300000);
