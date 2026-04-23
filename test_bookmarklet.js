// Bookmarklet Test Script
// Tạo bookmark với đoạn code dưới đây và click để chạy trên trình duyệt

javascript:(function(){
var API='http://localhost:3000';
var token='';
var results=[];

function log(msg, ok){console.log((ok?'✓':'✗')+' '+msg);}
function req(url,m,body){
  return fetch(url,{method:m,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):void 0}).then(r=>r.json());
}

async function test(){
  console.clear();
  console.log('=== Testing AI Chat App ===');
  
  try{
    var h=await req(API+'/api/health','GET');
    log('Health Check',h.success);
    results.push({n:'health',s:h.success});
  }catch(e){log('Health: '+e.message,false);}
  
  var u='user'+Date.now();
  try{
    var r=await req(API+'/api/auth/register','POST',{username:u,email:u+'@t.com',password:'123456'});
    log('Register: '+(r.success?'OK':'Failed'),r.success);
    results.push({n:'register',s:r.success});
  }catch(e){log('Register: '+e.message,false);}
  
  try{
    var l=await req(API+'/api/auth/login','POST',{username:u,password:'123456'});
    log('Login: '+(l.success?'OK':'Failed'),l.success);
    token=l.data?.token||'';
    results.push({n:'login',s:l.success});
  }catch(e){log('Login: '+e.message,false);}
  
  if(token)try{
    var p=await fetch(API+'/api/auth/me',{headers:{Authorization:'Bearer '+token}}).then(r=>r.json());
    log('Profile: '+(p.success?'OK':'Failed'),p.success);
    results.push({n:'profile',s:p.success});
  }catch(e){log('Profile: '+e.message,false);}
  
  try{
    var us=await req(API+'/api/users','GET');
    log('Users List: '+(us.success?'OK':'Failed'),us.success);
    results.push({n:'users',s:us.success});
  }catch(e){log('Users: '+e.message,false);}
  
  console.log('=== Summary ===');
  results.forEach(function(r){console.log((r.s?'✓':'✗')+' '+r.n);});
}

test();
})();