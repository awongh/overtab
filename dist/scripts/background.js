"use strict";function rangeConstrict(a){var b=1,c=42,d=1,e=1638,f=(a-b)/(c-b),g=f*(e-d)+d;return g+=.618033988749895,Math.abs(Math.round(g%=c))}Object.size=function(a){var b,c=0;for(b in a)a.hasOwnProperty(b)&&c++;return c},Array.prototype.remove=function(a){return this.splice(a,1)},Array.prototype.add=function(a,b){if(!b)throw"Trying to add a null variable to array. -oops";return this.splice(a,0,b)},Array.prototype.hasValue=function(a){return-1===this.indexOf(a)?!1:!0},Array.prototype.removeValue=function(a){var b=this.indexOf(a);return-1===b?!1:this.remove(b)},Array.prototype.getByValue=function(a){var b=this.indexOf(a);return-1!==b?this[b]:!1},Array.prototype.getByValueProperty=function(a,b){for(var c=0;c<this.length;c++)if(this[c].hasOwnProperty(a)&&this[c][a]==b)return this[c];return!1},Array.prototype.hasValueProperty=function(a,b){return this.getByValueProperty(a,b)===!1?!1:!0},Array.prototype.valuePropertyIndex=function(a,b){for(var c=0;c<this.length;c++)if(this[c].hasOwnProperty(a)&&this[c][a]===b)return c;return!1};var DISALLOWED_SCREENCAP_URLS=["chrome://newtab/"],ALLOWED_PROTOCOLS=["http:","https:","chrome:"],Parser=function(){this.parser=document.createElement("a")};Parser.prototype={href:function(a){return this.parser.href=a,this},protocol:function(){return this.parser.protocol},hostname:function(){return this.parser.hostname},port:function(){return this.parser.port},pathname:function(){return this.parser.pathname},search:function(){return this.parser.search},hash:function(){return this.parser.hash},host:function(){return this.parser.host}};var stringToInt=function(a){for(var b=0,c="ABCDEFGHIJKLMNOPQRSTUVWXYZ",d=a.toUpperCase(),e=0;e<d.length;e++)b+=c.indexOf(d[e]);return b},PNG;PNG=function(){function a(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o;for(this.data=a,this.pos=8,this.palette=[],this.imgData=[],this.transparency={},this.animation=null,this.text={},f=null;;){switch(b=this.readUInt32(),j=function(){var a,b;for(b=[],g=a=0;4>a;g=++a)b.push(String.fromCharCode(this.data[this.pos++]));return b}.call(this).join("")){case"IHDR":this.width=this.readUInt32(),this.height=this.readUInt32(),this.bits=this.data[this.pos++],this.colorType=this.data[this.pos++],this.compressionMethod=this.data[this.pos++],this.filterMethod=this.data[this.pos++],this.interlaceMethod=this.data[this.pos++];break;case"acTL":this.animation={numFrames:this.readUInt32(),numPlays:this.readUInt32()||1/0,frames:[]};break;case"PLTE":this.palette=this.read(b);break;case"fcTL":f&&this.animation.frames.push(f),this.pos+=4,f={width:this.readUInt32(),height:this.readUInt32(),xOffset:this.readUInt32(),yOffset:this.readUInt32()},e=this.readUInt16(),d=this.readUInt16()||100,f.delay=1e3*e/d,f.disposeOp=this.data[this.pos++],f.blendOp=this.data[this.pos++],f.data=[];break;case"IDAT":case"fdAT":for("fdAT"===j&&(this.pos+=4,b-=4),a=(null!=f?f.data:void 0)||this.imgData,g=m=0;b>=0?b>m:m>b;g=b>=0?++m:--m)a.push(this.data[this.pos++]);break;case"tRNS":switch(this.transparency={},this.colorType){case 3:if(this.transparency.indexed=this.read(b),k=255-this.transparency.indexed.length,k>0)for(g=n=0;k>=0?k>n:n>k;g=k>=0?++n:--n)this.transparency.indexed.push(255);break;case 0:this.transparency.grayscale=this.read(b)[0];break;case 2:this.transparency.rgb=this.read(b)}break;case"tEXt":l=this.read(b),h=l.indexOf(0),i=String.fromCharCode.apply(String,l.slice(0,h)),this.text[i]=String.fromCharCode.apply(String,l.slice(h+1));break;case"IEND":return f&&this.animation.frames.push(f),this.colors=function(){switch(this.colorType){case 0:case 3:case 4:return 1;case 2:case 6:return 3}}.call(this),this.hasAlphaChannel=4===(o=this.colorType)||6===o,c=this.colors+(this.hasAlphaChannel?1:0),this.pixelBitlength=this.bits*c,this.colorSpace=function(){switch(this.colors){case 1:return"DeviceGray";case 3:return"DeviceRGB"}}.call(this),void(this.imgData=new Uint8Array(this.imgData));default:this.pos+=b}if(this.pos+=4,this.pos>this.data.length)throw new Error("Incomplete or corrupt PNG file")}}var b,c,d,e,f,g,h,i;return a.load=function(b,c,d){var e;return"function"==typeof c&&(d=c),e=new XMLHttpRequest,e.open("GET",b,!0),e.responseType="arraybuffer",e.onload=function(){var b,f;return b=new Uint8Array(e.response||e.mozResponseArrayBuffer),f=new a(b),"function"==typeof(null!=c?c.getContext:void 0)&&f.render(c),"function"==typeof d?d(f):void 0},e.send(null)},e=0,d=1,f=2,c=0,b=1,a.prototype.read=function(a){var b,c,d;for(d=[],b=c=0;a>=0?a>c:c>a;b=a>=0?++c:--c)d.push(this.data[this.pos++]);return d},a.prototype.readUInt32=function(){var a,b,c,d;return a=this.data[this.pos++]<<24,b=this.data[this.pos++]<<16,c=this.data[this.pos++]<<8,d=this.data[this.pos++],a|b|c|d},a.prototype.readUInt16=function(){var a,b;return a=this.data[this.pos++]<<8,b=this.data[this.pos++],a|b},a.prototype.decodePixels=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x;if(null==a&&(a=this.imgData),0===a.length)return new Uint8Array(0);for(a=new FlateStream(a),a=a.getBytes(),m=this.pixelBitlength/8,q=m*this.width,n=new Uint8Array(q*this.height),g=a.length,p=0,o=0,c=0;g>o;){switch(a[o++]){case 0:for(e=t=0;q>t;e=t+=1)n[c++]=a[o++];break;case 1:for(e=u=0;q>u;e=u+=1)b=a[o++],f=m>e?0:n[c-m],n[c++]=(b+f)%256;break;case 2:for(e=v=0;q>v;e=v+=1)b=a[o++],d=(e-e%m)/m,r=p&&n[(p-1)*q+d*m+e%m],n[c++]=(r+b)%256;break;case 3:for(e=w=0;q>w;e=w+=1)b=a[o++],d=(e-e%m)/m,f=m>e?0:n[c-m],r=p&&n[(p-1)*q+d*m+e%m],n[c++]=(b+Math.floor((f+r)/2))%256;break;case 4:for(e=x=0;q>x;e=x+=1)b=a[o++],d=(e-e%m)/m,f=m>e?0:n[c-m],0===p?r=s=0:(r=n[(p-1)*q+d*m+e%m],s=d&&n[(p-1)*q+(d-1)*m+e%m]),h=f+r-s,i=Math.abs(h-f),k=Math.abs(h-r),l=Math.abs(h-s),j=k>=i&&l>=i?f:l>=k?r:s,n[c++]=(b+j)%256;break;default:throw new Error("Invalid filter algorithm: "+a[o-1])}p++}return n},a.prototype.decodePalette=function(){var a,b,c,d,e,f,g,h,i,j;for(d=this.palette,g=this.transparency.indexed||[],f=new Uint8Array((g.length||0)+d.length),e=0,c=d.length,a=0,b=h=0,i=d.length;i>h;b=h+=3)f[e++]=d[b],f[e++]=d[b+1],f[e++]=d[b+2],f[e++]=null!=(j=g[a++])?j:255;return f},a.prototype.copyToImageData=function(a,b){var c,d,e,f,g,h,i,j,k,l,m;if(d=this.colors,k=null,c=this.hasAlphaChannel,this.palette.length&&(k=null!=(m=this._decodedPalette)?m:this._decodedPalette=this.decodePalette(),d=4,c=!0),e=a.data||a,j=e.length,g=k||b,f=h=0,1===d)for(;j>f;)i=k?4*b[f/4]:h,l=g[i++],e[f++]=l,e[f++]=l,e[f++]=l,e[f++]=c?g[i++]:255,h=i;else for(;j>f;)i=k?4*b[f/4]:h,e[f++]=g[i++],e[f++]=g[i++],e[f++]=g[i++],e[f++]=c?g[i++]:255,h=i},a.prototype.decode=function(){var a;return a=new Uint8Array(this.width*this.height*4),this.copyToImageData(a,this.decodePixels()),a},h=null,i=null,g=function(a){var b;return i.width=a.width,i.height=a.height,i.clearRect(0,0,a.width,a.height),i.putImageData(a,0,0),b=new Image,b.src=h.toDataURL(),b},a.prototype.decodeFrames=function(a){var b,c,d,e,f,h,i,j;if(this.animation){for(i=this.animation.frames,j=[],c=f=0,h=i.length;h>f;c=++f)b=i[c],d=a.createImageData(b.width,b.height),e=this.decodePixels(new Uint8Array(b.data)),this.copyToImageData(d,e),b.imageData=d,j.push(b.image=g(d));return j}},a.prototype.renderFrame=function(a,b){var e,g,h;return g=this.animation.frames,e=g[b],h=g[b-1],0===b&&a.clearRect(0,0,this.width,this.height),(null!=h?h.disposeOp:void 0)===d?a.clearRect(h.xOffset,h.yOffset,h.width,h.height):(null!=h?h.disposeOp:void 0)===f&&a.putImageData(h.imageData,h.xOffset,h.yOffset),e.blendOp===c&&a.clearRect(e.xOffset,e.yOffset,e.width,e.height),a.drawImage(e.image,e.xOffset,e.yOffset)},a.prototype.animate=function(a){var b,c,d,e,f,g,h=this;return c=0,g=this.animation,e=g.numFrames,d=g.frames,f=g.numPlays,(b=function(){var g,i;return g=c++%e,i=d[g],h.renderFrame(a,g),e>1&&f>c/e?h.animation._timeout=setTimeout(b,i.delay):void 0})()},a.prototype.stopAnimation=function(){var a;return clearTimeout(null!=(a=this.animation)?a._timeout:void 0)},a.prototype.render=function(a){var b,c;return a._png&&a._png.stopAnimation(),a._png=this,a.width=this.width,a.height=this.height,b=a.getContext("2d"),this.animation?(this.decodeFrames(b),this.animate(b)):(c=b.createImageData(this.width,this.height),this.copyToImageData(c,this.decodePixels()),b.putImageData(c,0,0))},a}();var DecodeStream=function(){function a(){this.pos=0,this.bufferLength=0,this.eof=!1,this.buffer=null}return a.prototype={ensureBuffer:function(a){var b=this.buffer,c=b?b.byteLength:0;if(c>a)return b;for(var d=512;a>d;)d<<=1;for(var e=new Uint8Array(d),f=0;c>f;++f)e[f]=b[f];return this.buffer=e},getByte:function(){for(var a=this.pos;this.bufferLength<=a;){if(this.eof)return null;this.readBlock()}return this.buffer[this.pos++]},getBytes:function(a){var b=this.pos;if(a){this.ensureBuffer(b+a);for(var c=b+a;!this.eof&&this.bufferLength<c;)this.readBlock();var d=this.bufferLength;c>d&&(c=d)}else{for(;!this.eof;)this.readBlock();var c=this.bufferLength}return this.pos=c,this.buffer.subarray(b,c)},lookChar:function(){for(var a=this.pos;this.bufferLength<=a;){if(this.eof)return null;this.readBlock()}return String.fromCharCode(this.buffer[this.pos])},getChar:function(){for(var a=this.pos;this.bufferLength<=a;){if(this.eof)return null;this.readBlock()}return String.fromCharCode(this.buffer[this.pos++])},makeSubStream:function(a,b,c){for(var d=a+b;this.bufferLength<=d&&!this.eof;)this.readBlock();return new Stream(this.buffer,a,b,c)},skip:function(a){a||(a=1),this.pos+=a},reset:function(){this.pos=0}},a}(),FlateStream=function(){function a(a){throw new Error(a)}function b(b){var c=0,d=b[c++],e=b[c++];(-1==d||-1==e)&&a("Invalid header in flate stream"),8!=(15&d)&&a("Unknown compression method in flate stream"),((d<<8)+e)%31!=0&&a("Bad FCHECK in flate stream"),32&e&&a("FDICT bit set in flate stream"),this.bytes=b,this.bytesPos=c,this.codeSize=0,this.codeBuf=0,DecodeStream.call(this)}var c=new Uint32Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),d=new Uint32Array([3,4,5,6,7,8,9,10,65547,65549,65551,65553,131091,131095,131099,131103,196643,196651,196659,196667,262211,262227,262243,262259,327811,327843,327875,327907,258,258,258]),e=new Uint32Array([1,2,3,4,65541,65543,131081,131085,196625,196633,262177,262193,327745,327777,393345,393409,459009,459137,524801,525057,590849,591361,657409,658433,724993,727041,794625,798721,868353,876545]),f=[new Uint32Array([459008,524368,524304,524568,459024,524400,524336,590016,459016,524384,524320,589984,524288,524416,524352,590048,459012,524376,524312,589968,459028,524408,524344,590032,459020,524392,524328,59e4,524296,524424,524360,590064,459010,524372,524308,524572,459026,524404,524340,590024,459018,524388,524324,589992,524292,524420,524356,590056,459014,524380,524316,589976,459030,524412,524348,590040,459022,524396,524332,590008,524300,524428,524364,590072,459009,524370,524306,524570,459025,524402,524338,590020,459017,524386,524322,589988,524290,524418,524354,590052,459013,524378,524314,589972,459029,524410,524346,590036,459021,524394,524330,590004,524298,524426,524362,590068,459011,524374,524310,524574,459027,524406,524342,590028,459019,524390,524326,589996,524294,524422,524358,590060,459015,524382,524318,589980,459031,524414,524350,590044,459023,524398,524334,590012,524302,524430,524366,590076,459008,524369,524305,524569,459024,524401,524337,590018,459016,524385,524321,589986,524289,524417,524353,590050,459012,524377,524313,589970,459028,524409,524345,590034,459020,524393,524329,590002,524297,524425,524361,590066,459010,524373,524309,524573,459026,524405,524341,590026,459018,524389,524325,589994,524293,524421,524357,590058,459014,524381,524317,589978,459030,524413,524349,590042,459022,524397,524333,590010,524301,524429,524365,590074,459009,524371,524307,524571,459025,524403,524339,590022,459017,524387,524323,589990,524291,524419,524355,590054,459013,524379,524315,589974,459029,524411,524347,590038,459021,524395,524331,590006,524299,524427,524363,590070,459011,524375,524311,524575,459027,524407,524343,590030,459019,524391,524327,589998,524295,524423,524359,590062,459015,524383,524319,589982,459031,524415,524351,590046,459023,524399,524335,590014,524303,524431,524367,590078,459008,524368,524304,524568,459024,524400,524336,590017,459016,524384,524320,589985,524288,524416,524352,590049,459012,524376,524312,589969,459028,524408,524344,590033,459020,524392,524328,590001,524296,524424,524360,590065,459010,524372,524308,524572,459026,524404,524340,590025,459018,524388,524324,589993,524292,524420,524356,590057,459014,524380,524316,589977,459030,524412,524348,590041,459022,524396,524332,590009,524300,524428,524364,590073,459009,524370,524306,524570,459025,524402,524338,590021,459017,524386,524322,589989,524290,524418,524354,590053,459013,524378,524314,589973,459029,524410,524346,590037,459021,524394,524330,590005,524298,524426,524362,590069,459011,524374,524310,524574,459027,524406,524342,590029,459019,524390,524326,589997,524294,524422,524358,590061,459015,524382,524318,589981,459031,524414,524350,590045,459023,524398,524334,590013,524302,524430,524366,590077,459008,524369,524305,524569,459024,524401,524337,590019,459016,524385,524321,589987,524289,524417,524353,590051,459012,524377,524313,589971,459028,524409,524345,590035,459020,524393,524329,590003,524297,524425,524361,590067,459010,524373,524309,524573,459026,524405,524341,590027,459018,524389,524325,589995,524293,524421,524357,590059,459014,524381,524317,589979,459030,524413,524349,590043,459022,524397,524333,590011,524301,524429,524365,590075,459009,524371,524307,524571,459025,524403,524339,590023,459017,524387,524323,589991,524291,524419,524355,590055,459013,524379,524315,589975,459029,524411,524347,590039,459021,524395,524331,590007,524299,524427,524363,590071,459011,524375,524311,524575,459027,524407,524343,590031,459019,524391,524327,589999,524295,524423,524359,590063,459015,524383,524319,589983,459031,524415,524351,590047,459023,524399,524335,590015,524303,524431,524367,590079]),9],g=[new Uint32Array([327680,327696,327688,327704,327684,327700,327692,327708,327682,327698,327690,327706,327686,327702,327694,0,327681,327697,327689,327705,327685,327701,327693,327709,327683,327699,327691,327707,327687,327703,327695,0]),5];return b.prototype=Object.create(DecodeStream.prototype),b.prototype.getBits=function(b){for(var c,d=this.codeSize,e=this.codeBuf,f=this.bytes,g=this.bytesPos;b>d;)"undefined"==typeof(c=f[g++])&&a("Bad encoding in flate stream"),e|=c<<d,d+=8;return c=e&(1<<b)-1,this.codeBuf=e>>b,this.codeSize=d-=b,this.bytesPos=g,c},b.prototype.getCode=function(b){for(var c=b[0],d=b[1],e=this.codeSize,f=this.codeBuf,g=this.bytes,h=this.bytesPos;d>e;){var i;"undefined"==typeof(i=g[h++])&&a("Bad encoding in flate stream"),f|=i<<e,e+=8}var j=c[f&(1<<d)-1],k=j>>16,l=65535&j;return(0==e||k>e||0==k)&&a("Bad encoding in flate stream"),this.codeBuf=f>>k,this.codeSize=e-k,this.bytesPos=h,l},b.prototype.generateHuffmanTable=function(a){for(var b=a.length,c=0,d=0;b>d;++d)a[d]>c&&(c=a[d]);for(var e=1<<c,f=new Uint32Array(e),g=1,h=0,i=2;c>=g;++g,h<<=1,i<<=1)for(var j=0;b>j;++j)if(a[j]==g){for(var k=0,l=h,d=0;g>d;++d)k=k<<1|1&l,l>>=1;for(var d=k;e>d;d+=i)f[d]=g<<16|j;++h}return[f,c]},b.prototype.readBlock=function(){function b(a,b,c,d,e){for(var f=a.getBits(c)+d;f-->0;)b[x++]=e}var h=this.getBits(3);if(1&h&&(this.eof=!0),h>>=1,0==h){var i,j=this.bytes,k=this.bytesPos;"undefined"==typeof(i=j[k++])&&a("Bad block header in flate stream");var l=i;"undefined"==typeof(i=j[k++])&&a("Bad block header in flate stream"),l|=i<<8,"undefined"==typeof(i=j[k++])&&a("Bad block header in flate stream");var m=i;"undefined"==typeof(i=j[k++])&&a("Bad block header in flate stream"),m|=i<<8,m!=(65535&~l)&&a("Bad uncompressed block length in flate stream"),this.codeBuf=0,this.codeSize=0;var n=this.bufferLength,o=this.ensureBuffer(n+l),p=n+l;this.bufferLength=p;for(var q=n;p>q;++q){if("undefined"==typeof(i=j[k++])){this.eof=!0;break}o[q]=i}return void(this.bytesPos=k)}var r,s;if(1==h)r=f,s=g;else if(2==h){for(var t=this.getBits(5)+257,u=this.getBits(5)+1,v=this.getBits(4)+4,w=Array(c.length),x=0;v>x;)w[c[x++]]=this.getBits(3);for(var y=this.generateHuffmanTable(w),z=0,x=0,A=t+u,B=new Array(A);A>x;){var C=this.getCode(y);16==C?b(this,B,2,3,z):17==C?b(this,B,3,3,z=0):18==C?b(this,B,7,11,z=0):B[x++]=z=C}r=this.generateHuffmanTable(B.slice(0,t)),s=this.generateHuffmanTable(B.slice(t,A))}else a("Unknown block type in flate stream");for(var o=this.buffer,D=o?o.length:0,E=this.bufferLength;;){var F=this.getCode(r);if(256>F)E+1>=D&&(o=this.ensureBuffer(E+1),D=o.length),o[E++]=F;else{if(256==F)return void(this.bufferLength=E);F-=257,F=d[F];var G=F>>16;G>0&&(G=this.getBits(G));var z=(65535&F)+G;F=this.getCode(s),F=e[F],G=F>>16,G>0&&(G=this.getBits(G));var H=(65535&F)+G;E+z>=D&&(o=this.ensureBuffer(E+z),D=o.length);for(var I=0;z>I;++I,++E)o[E]=o[E-H]}}},b}(),options=[{name:"opener",type:"radio"}],tabQuery=function(a,b){return chrome.tabs.query(a,function(a){b(a&&a.length>0&&a[0].id?a[0]:!1)})},tabsQuery=function(a,b){return chrome.tabs.query(a,b)},getTab=function(a,b){return chrome.tabs.get(a,b)},tabFocus=function(a,b,c){chrome.windows.update(b,{focused:!0},function(){chrome.tabs.update(a,{active:!0},function(){tabEvent(c,"overtab")})})},tabEvent=function(a,b){sendMessage(null,{message:b,id:a})},sendMessage=function(a,b,c){return chrome.runtime.sendMessage(a,b,c)},lsGet=function(a,b){chrome.storage.local.get(String(a),b)},lsSet=function(a,b){chrome.storage.local.set(a,b),a=void 0},lsRemove=function(a,b){if("function"==typeof b){var c=String(a);chrome.storage.local.remove([c,"screencap-"+c,"screencap-url-"+c],b)}},chromeBadge=function(a){chrome.browserAction.setBadgeText({text:String(a)})},calcDimensions=function(a,b){var c,d,e=THUMBSIZE/SCREEN_CROP_RATIO;return a>b?(c=e,d=e*(a/b)):(d=e,c=e*(b/a)),{height:Math.round(c),width:Math.round(d)}},processImage=function(a,b,c,d,e){var f=calcDimensions(d,e),g=document.createElement("canvas"),h=g.getContext("2d");g.width=f.width,g.height=f.height;var i=new Worker("scripts/image-worker.js");if(i.onmessage=function(c){var d=c.data.returnedData;h.clearRect(0,0,f.width,f.height),h.putImageData(d,0,0);var e="screencap-"+a,i={};i[e]=g.toDataURL("jpeg",.9),i["screencap-url-"+a]=b,lsSet(i,function(){tabEvent(a,"screencap")}),h=void 0,g=void 0},c){var j=h.createImageData(f.width,f.height);i.postMessage({url:c,imageData:j,w2:f.width,h2:f.height})}i=void 0,c=void 0,img=void 0},THUMBSIZE=150,SCREEN_CROP_RATIO=1,OVERTAB_TAB_ID=null,OVERTAB_WINDOW_ID=null,isVerifiedTabUrl=function(a){if(a.hasOwnProperty("url")){{var b=new Parser,c=b.href(a.url).protocol();b.href(a.url).hostname()}if(a.hasOwnProperty("id")&&-1!==ALLOWED_PROTOCOLS.indexOf(c)&&a.id!=OVERTAB_TAB_ID)return!0}return!1},setTabCount=function(){tabsQuery({},function(a){for(var b=0,c=0;c<a.length;c++)isVerifiedTabUrl(a[c])&&b++;chromeBadge(b)})},tabCreated=function(a){if(isVerifiedTabUrl(a)){var b={};b[a.id]=a.url,b["screencap-"+a.id]="",b["screencap-url-"+a.id]="",lsSet(b,function(){tabEvent(a.id,"created"),setTabCount()})}},tabUpdated=function(a,b,c){if(isVerifiedTabUrl(c)){var d=c.id;lsGet(d,function(a){if(a&&a.hasOwnProperty(d))"complete"==b.status&&(tabEvent(d,"updated"),screenCap(c));else{var e={};e[c.id]=c.url,e["screencap-"+c.id]="",e["screencap-url-"+c.id]="",lsSet(e,function(){tabEvent(d,"pre-update")})}})}},screenCap=function(a){var b="screencap-url-"+a.id;lsGet(b,function(c){if(!c||!c.hasOwnProperty(b))return!1;var d=c[b];if(a.url==d)return!1;var e={currentWindow:!0,windowId:a.windowId,active:!0,status:"complete"};tabQuery(e,function(b){b.id==a.id&&b.windowId==a.windowId&&d!=b.url&&-1===DISALLOWED_SCREENCAP_URLS.indexOf(b.url)&&generateScreenCap(b.windowId,{format:"png"},function(c){processImage(a.id,b.url,c,b.width,b.height),c=void 0})})})},tabActivated=function(a){var b=a.tabId;lsGet(b,function(a){a&&null!==a&&a.hasOwnProperty(b)&&(tabEvent(b,"activated"),getTab(b,function(a){a&&"undefined"!=typeof a.id&&screenCap(a)}))})},tabRemoved=function(a){a===OVERTAB_TAB_ID?(OVERTAB_TAB_ID=null,OVERTAB_WINDOW_ID=null,lsSet({OVERTAB_TAB_ID:null,OVERTAB_WINDOW_ID:null})):lsRemove(a,function(){tabEvent(a,"removed"),setTabCount()})},onMessage=function(){},openOverTab=function(a){lsGet("opener",function(b){var c,d=b.opener,e={url:getExtensionUrl()};switch(d){case"window":e.focused=!0,c=chrome.windows.create;break;default:e.active=!0,c=chrome.tabs.create}c(e,function(b){if(b.hasOwnProperty("tabs")&&b.tabs.length>0){var c=b.tabs.getByValueProperty("active",!0);if(!c)return;b=c}OVERTAB_TAB_ID=b.id,OVERTAB_WINDOW_ID=b.windowId,lsSet({OVERTAB_TAB_ID:OVERTAB_TAB_ID,OVERTAB_WINDOW_ID:OVERTAB_WINDOW_ID}),tabEvent(a,"overtab")})})},browserActionClick=function(){var a={active:!0};tabQuery(a,function(a){var b=0;if(a)var b=a.id;null===OVERTAB_TAB_ID||null===OVERTAB_WINDOW_ID||"undefined"===OVERTAB_TAB_ID||"undefined"===OVERTAB_WINDOW_ID?lsGet("OVERTAB_TAB_ID",function(a){a&&null!==a&&a.hasOwnProperty("OVERTAB_TAB_ID")&&null!==a.OVERTAB_TAB_ID?(OVERTAB_TAB_ID=a.OVERTAB_TAB_ID,getTab(a.OVERTAB_TAB_ID,function(a){a&&"undefined"!=typeof a.id?lsGet("OVERTAB_WINDOW_ID",function(a){a&&null!==a&&a.hasOwnProperty("OVERTAB_WINDOW_ID")&&null!==a.OVERTAB_WINDOW_ID?(OVERTAB_WINDOW_ID=a.OVERTAB_WINDOW_ID,tabFocus(OVERTAB_TAB_ID,OVERTAB_WINDOW_ID,b)):openOverTab(b)}):openOverTab(b)})):openOverTab(b)}):tabFocus(OVERTAB_TAB_ID,OVERTAB_WINDOW_ID,b)})},getAllTabs=function(){lsGet("OVERTAB_TAB_ID",function(a){var b=null;a.hasOwnProperty("OVERTAB_TAB_ID")&&(b=a.OVERTAB_TAB_ID);new Parser;tabsQuery({},function(a){for(var c=0;c<a.length;c++){var d=a[c];isVerifiedTabUrl(d)&&d.id!=b&&"complete"===d.status&&tabCreated(d)}})})},tabReplaced=function(a,b){lsGet(b,function(c){if(c&&!c.hasOwnProperty(id)){var d={};d[a]=c.url,d["screencap-"+a]="",d["screencap-url-"+a]="",lsSet(d,function(){sendMessage(null,{message:"replaced",id:a,oldId:b})})}})},startup=function(){chrome.storage.local.clear(),getAllTabs()},shutdown=function(){chrome.storage.local.clear()},install=function(){chrome.storage.local.clear(),getAllTabs()};chrome.runtime.onStartup.addListener(startup),chrome.runtime.onSuspend.addListener(shutdown),chrome.runtime.onInstalled.addListener(install);var getExtensionUrl=function(){return chrome.extension.getURL("index.html")};chrome.runtime.onMessage.addListener(onMessage);var generateScreenCap=function(a,b,c){return chrome.tabs.captureVisibleTab(a,b,c)};chrome.tabs.onCreated.addListener(tabCreated),chrome.tabs.onUpdated.addListener(tabUpdated),chrome.tabs.onActivated.addListener(tabActivated),chrome.tabs.onRemoved.addListener(tabRemoved),chrome.browserAction.onClicked.addListener(browserActionClick),chrome.tabs.onReplaced.addListener(tabReplaced),chrome.runtime.onSuspend.addListener(function(){}),chrome.runtime.onSuspendCanceled.addListener(function(){});var getCurrentTab=function(a){chrome.tabs.getCurrent(a)};chrome.commands.onCommand.addListener(function(a){switch(a){case"open-overtab":browserActionClick()}});