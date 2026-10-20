window.Zip = (function(){
  const enc=new TextEncoder(), dec=new TextDecoder('utf-8');
  const TABLE=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
  function crc32(u8){let c=~0;for(let i=0;i<u8.length;i++)c=(c>>>8)^TABLE[(c^u8[i])&255];return (~c)>>>0;}
  const u16=v=>[v&255,(v>>>8)&255], u32=v=>[v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255];
  const cat=arr=>{let n=0;arr.forEach(a=>n+=a.length);const out=new Uint8Array(n);let o=0;arr.forEach(a=>{out.set(a,o);o+=a.length;});return out;};
  function build(files){
    const locals=[],centrals=[];let offset=0;
    const dosTime=u16(((new Date()).getHours()<<11)&0xFFFF), dosDate=u16(((((new Date()).getFullYear()-1980)<<9)|((new Date()).getMonth()+1)<<5|(new Date()).getDate())&0xFFFF);
    files.forEach(f=>{
      const data=f.data instanceof Uint8Array?f.data:enc(f.text||'');
      const name=enc(f.name), crc=crc32(data);
      const lh=cat([u32(0x04034b50),u16(20),u16(0x0800),u16(0),dosTime,dosDate,u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name]);
      locals.push(lh,data);
      centrals.push(cat([u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),dosTime,dosDate,u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),u16(0),u16(0),u32(0),u32(offset),name]));
      offset+=lh.length+data.length;
    });
    const cd=cat(centrals);
    const eocd=cat([u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(cd.length),u32(offset),u16(0)]);
    return cat([...locals,cd,eocd]);
  }
  function read(u8){
    const dv=new DataView(u8.buffer,u8.byteOffset,u8.byteLength);
    let eocd=-1;
    for(let i=u8.length-22;i>=Math.max(0,u8.length-65558);i--){
      if(dv.getUint32(i,true)===0x06054b50){eocd=i;break;}
    }
    if(eocd<0)throw new Error('ZIP: EOCD не найден');
    const count=dv.getUint16(eocd+10,true);
    let p=dv.getUint32(eocd+16,true);
    const out=[];
    for(let i=0;i<count;i++){
      if(dv.getUint32(p,true)!==0x02014b50)throw new Error('ZIP: повреждён центральный каталог');
      const method=dv.getUint16(p+10,true), csize=dv.getUint32(p+20,true);
      const nl=dv.getUint16(p+28,true), el=dv.getUint16(p+30,true), cl=dv.getUint16(p+32,true);
      const lho=dv.getUint32(p+42,true);
      const name=dec.decode(u8.subarray(p+46,p+46+nl));
      const lnl=dv.getUint16(lho+26,true), lel=dv.getUint16(lho+28,true);
      const start=lho+30+lnl+lel;
      if(method!==0)throw new Error('ZIP: сжатые архивы не поддерживаются');
      out.push({name,data:u8.slice(start,start+csize)});
      p+=46+nl+el+cl;
    }
    return out;
  }
  return {build, read, crc32};
})();