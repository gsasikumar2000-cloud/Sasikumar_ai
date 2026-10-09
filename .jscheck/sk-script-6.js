
function skHomeSearch(q){
  q=(q||'').trim();
  if(!q)return;
  const x=q.toLowerCase();

  if(x.includes('gold') || x.includes('silver')){
    location.href='/gold.html';
  }else if(x.includes('education') || x.includes('math') || x.includes('equation') || x.includes('study')){
    location.href='/education/';
  }else if(x.includes('job') || x.includes('career')){
    location.href='/jobs/';
  }else if(x.includes('sport') || x.includes('cricket') || x.includes('football')){
    location.href='/sports/';
  }else{
    const target=document.getElementById('searchInput');
    if(target){
      target.value=q;
      target.dispatchEvent(new Event('input',{bubbles:true}));
      target.focus();
    }else{
      alert('Search: '+q);
    }
  }
}

async function skShareHome(){
  const data={
    title:'SASIKUMAR AI',
    text:'SASIKUMAR AI — AI • Gold • Education • Jobs • Sports • Business',
    url:location.origin
  };
  try{
    if(navigator.share) await navigator.share(data);
    else if(navigator.clipboard){
      await navigator.clipboard.writeText(location.href);
      alert('🔗 SASIKUMAR AI link copied!');
    }else{
      alert('🔗 Copy this page link: '+location.href);
    }
  }catch(e){}
}
