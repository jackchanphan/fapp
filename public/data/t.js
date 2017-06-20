
var flag = -1;
var cnt = 4;
var str = "";
for(var i=0;i<7;i++){
  cnt=cnt+flag;
  for(var j=0;j<7;j++){
    if(j>cnt &&j<7-cnt){
      str+='*'
    }else{
      str+=' ';
    }
  }
  if(cnt==0){flag=1;}
  str+='\n';
}
console.log(str);