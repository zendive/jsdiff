(function (root, factory) {

    // inline jsondiffpatch
    var jsondiffpatch = (function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
            var environment=require("./environment");environment.isBrowser&&(window.diff_match_patch=require("../public/external/diff_match_patch_uncompressed")),module.exports=require("./main");
        },{"../public/external/diff_match_patch_uncompressed":2,"./environment":10,"./main":17}],2:[function(require,module,exports){
            function diff_match_patch(){this.Diff_Timeout=1,this.Diff_EditCost=4,this.Match_Threshold=.5,this.Match_Distance=1e3,this.Patch_DeleteThreshold=.5,this.Patch_Margin=4,this.Match_MaxBits=32}var DIFF_DELETE=-1,DIFF_INSERT=1,DIFF_EQUAL=0;diff_match_patch.Diff,diff_match_patch.prototype.diff_main=function(t,n,e,i){"undefined"==typeof i&&(i=this.Diff_Timeout<=0?Number.MAX_VALUE:(new Date).getTime()+1e3*this.Diff_Timeout);var h=i;if(null==t||null==n)throw new Error("Null input. (diff_main)");if(t==n)return t?[[DIFF_EQUAL,t]]:[];"undefined"==typeof e&&(e=!0);var r=e,f=this.diff_commonPrefix(t,n),a=t.substring(0,f);t=t.substring(f),n=n.substring(f),f=this.diff_commonSuffix(t,n);var s=t.substring(t.length-f);t=t.substring(0,t.length-f),n=n.substring(0,n.length-f);var l=this.diff_compute_(t,n,r,h);return a&&l.unshift([DIFF_EQUAL,a]),s&&l.push([DIFF_EQUAL,s]),this.diff_cleanupMerge(l),l},diff_match_patch.prototype.diff_compute_=function(t,n,e,i){var h;if(!t)return[[DIFF_INSERT,n]];if(!n)return[[DIFF_DELETE,t]];var r=t.length>n.length?t:n,f=t.length>n.length?n:t,a=r.indexOf(f);if(-1!=a)return h=[[DIFF_INSERT,r.substring(0,a)],[DIFF_EQUAL,f],[DIFF_INSERT,r.substring(a+f.length)]],t.length>n.length&&(h[0][0]=h[2][0]=DIFF_DELETE),h;if(1==f.length)return[[DIFF_DELETE,t],[DIFF_INSERT,n]];r=f=null;var s=this.diff_halfMatch_(t,n);if(s){var l=s[0],g=s[1],c=s[2],_=s[3],o=s[4],u=this.diff_main(l,c,e,i),p=this.diff_main(g,_,e,i);return u.concat([[DIFF_EQUAL,o]],p)}return e&&t.length>100&&n.length>100?this.diff_lineMode_(t,n,i):this.diff_bisect_(t,n,i)},diff_match_patch.prototype.diff_lineMode_=function(t,n,e){var i=this.diff_linesToChars_(t,n);t=i[0],n=i[1];var h=i[2],r=this.diff_bisect_(t,n,e);this.diff_charsToLines_(r,h),this.diff_cleanupSemantic(r),r.push([DIFF_EQUAL,""]);for(var f=0,a=0,s=0,l="",g="";f<r.length;){switch(r[f][0]){case DIFF_INSERT:s++,g+=r[f][1];break;case DIFF_DELETE:a++,l+=r[f][1];break;case DIFF_EQUAL:if(a>=1&&s>=1){var i=this.diff_main(l,g,!1,e);r.splice(f-a-s,a+s),f=f-a-s;for(var c=i.length-1;c>=0;c--)r.splice(f,0,i[c]);f+=i.length}s=0,a=0,l="",g=""}f++}return r.pop(),r},diff_match_patch.prototype.diff_bisect_=function(t,n,e){for(var i=t.length,h=n.length,r=Math.ceil((i+h)/2),f=r,a=2*r,s=new Array(a),l=new Array(a),g=0;a>g;g++)s[g]=-1,l[g]=-1;s[f+1]=0,l[f+1]=0;for(var c=i-h,_=c%2!=0,o=0,u=0,p=0,d=0,F=0;r>F&&!((new Date).getTime()>e);F++){for(var E=-F+o;F-u>=E;E+=2){var D,I=f+E;D=E==-F||E!=F&&s[I-1]<s[I+1]?s[I+1]:s[I-1]+1;for(var m=D-E;i>D&&h>m&&t.charAt(D)==n.charAt(m);)D++,m++;if(s[I]=D,D>i)u+=2;else if(m>h)o+=2;else if(_){var b=f+c-E;if(b>=0&&a>b&&-1!=l[b]){var v=i-l[b];if(D>=v)return this.diff_bisectSplit_(t,n,D,m,e)}}}for(var L=-F+p;F-d>=L;L+=2){var v,b=f+L;v=L==-F||L!=F&&l[b-1]<l[b+1]?l[b+1]:l[b-1]+1;for(var T=v-L;i>v&&h>T&&t.charAt(i-v-1)==n.charAt(h-T-1);)v++,T++;if(l[b]=v,v>i)d+=2;else if(T>h)p+=2;else if(!_){var I=f+c-L;if(I>=0&&a>I&&-1!=s[I]){var D=s[I],m=f+D-I;if(v=i-v,D>=v)return this.diff_bisectSplit_(t,n,D,m,e)}}}}return[[DIFF_DELETE,t],[DIFF_INSERT,n]]},diff_match_patch.prototype.diff_bisectSplit_=function(t,n,e,i,h){var r=t.substring(0,e),f=n.substring(0,i),a=t.substring(e),s=n.substring(i),l=this.diff_main(r,f,!1,h),g=this.diff_main(a,s,!1,h);return l.concat(g)},diff_match_patch.prototype.diff_linesToChars_=function(t,n){function e(t){for(var n="",e=0,r=-1,f=i.length;r<t.length-1;){r=t.indexOf("\n",e),-1==r&&(r=t.length-1);var a=t.substring(e,r+1);e=r+1,(h.hasOwnProperty?h.hasOwnProperty(a):void 0!==h[a])?n+=String.fromCharCode(h[a]):(n+=String.fromCharCode(f),h[a]=f,i[f++]=a)}return n}var i=[],h={};i[0]="";var r=e(t),f=e(n);return[r,f,i]},diff_match_patch.prototype.diff_charsToLines_=function(t,n){for(var e=0;e<t.length;e++){for(var i=t[e][1],h=[],r=0;r<i.length;r++)h[r]=n[i.charCodeAt(r)];t[e][1]=h.join("")}},diff_match_patch.prototype.diff_commonPrefix=function(t,n){if(!t||!n||t.charAt(0)!=n.charAt(0))return 0;for(var e=0,i=Math.min(t.length,n.length),h=i,r=0;h>e;)t.substring(r,h)==n.substring(r,h)?(e=h,r=e):i=h,h=Math.floor((i-e)/2+e);return h},diff_match_patch.prototype.diff_commonSuffix=function(t,n){if(!t||!n||t.charAt(t.length-1)!=n.charAt(n.length-1))return 0;for(var e=0,i=Math.min(t.length,n.length),h=i,r=0;h>e;)t.substring(t.length-h,t.length-r)==n.substring(n.length-h,n.length-r)?(e=h,r=e):i=h,h=Math.floor((i-e)/2+e);return h},diff_match_patch.prototype.diff_commonOverlap_=function(t,n){var e=t.length,i=n.length;if(0==e||0==i)return 0;e>i?t=t.substring(e-i):i>e&&(n=n.substring(0,e));var h=Math.min(e,i);if(t==n)return h;for(var r=0,f=1;;){var a=t.substring(h-f),s=n.indexOf(a);if(-1==s)return r;f+=s,0!=s&&t.substring(h-f)!=n.substring(0,f)||(r=f,f++)}},diff_match_patch.prototype.diff_halfMatch_=function(t,n){function e(t,n,e){for(var i,h,r,a,s=t.substring(e,e+Math.floor(t.length/4)),l=-1,g="";-1!=(l=n.indexOf(s,l+1));){var c=f.diff_commonPrefix(t.substring(e),n.substring(l)),_=f.diff_commonSuffix(t.substring(0,e),n.substring(0,l));g.length<_+c&&(g=n.substring(l-_,l)+n.substring(l,l+c),i=t.substring(0,e-_),h=t.substring(e+c),r=n.substring(0,l-_),a=n.substring(l+c))}return 2*g.length>=t.length?[i,h,r,a,g]:null}if(this.Diff_Timeout<=0)return null;var i=t.length>n.length?t:n,h=t.length>n.length?n:t;if(i.length<4||2*h.length<i.length)return null;var r,f=this,a=e(i,h,Math.ceil(i.length/4)),s=e(i,h,Math.ceil(i.length/2));if(!a&&!s)return null;r=s?a&&a[4].length>s[4].length?a:s:a;var l,g,c,_;t.length>n.length?(l=r[0],g=r[1],c=r[2],_=r[3]):(c=r[0],_=r[1],l=r[2],g=r[3]);var o=r[4];return[l,g,c,_,o]},diff_match_patch.prototype.diff_cleanupSemantic=function(t){for(var n=!1,e=[],i=0,h=null,r=0,f=0,a=0,s=0,l=0;r<t.length;)t[r][0]==DIFF_EQUAL?(e[i++]=r,f=s,a=l,s=0,l=0,h=t[r][1]):(t[r][0]==DIFF_INSERT?s+=t[r][1].length:l+=t[r][1].length,null!==h&&h.length<=Math.max(f,a)&&h.length<=Math.max(s,l)&&(t.splice(e[i-1],0,[DIFF_DELETE,h]),t[e[i-1]+1][0]=DIFF_INSERT,i--,i--,r=i>0?e[i-1]:-1,f=0,a=0,s=0,l=0,h=null,n=!0)),r++;for(n&&this.diff_cleanupMerge(t),this.diff_cleanupSemanticLossless(t),r=1;r<t.length;){if(t[r-1][0]==DIFF_DELETE&&t[r][0]==DIFF_INSERT){var g=t[r-1][1],c=t[r][1],_=this.diff_commonOverlap_(g,c);(_>=g.length/2||_>=c.length/2)&&(t.splice(r,0,[DIFF_EQUAL,c.substring(0,_)]),t[r-1][1]=g.substring(0,g.length-_),t[r+1][1]=c.substring(_),r++),r++}r++}},diff_match_patch.prototype.diff_cleanupSemanticLossless=function(t){function n(t,n){if(!t||!n)return 5;var a=0;return(t.charAt(t.length-1).match(e)||n.charAt(0).match(e))&&(a++,(t.charAt(t.length-1).match(i)||n.charAt(0).match(i))&&(a++,(t.charAt(t.length-1).match(h)||n.charAt(0).match(h))&&(a++,(t.match(r)||n.match(f))&&a++))),a}for(var e=/[^a-zA-Z0-9]/,i=/\s/,h=/[\r\n]/,r=/\n\r?\n$/,f=/^\r?\n\r?\n/,a=1;a<t.length-1;){if(t[a-1][0]==DIFF_EQUAL&&t[a+1][0]==DIFF_EQUAL){var s=t[a-1][1],l=t[a][1],g=t[a+1][1],c=this.diff_commonSuffix(s,l);if(c){var _=l.substring(l.length-c);s=s.substring(0,s.length-c),l=_+l.substring(0,l.length-c),g=_+g}for(var o=s,u=l,p=g,d=n(s,l)+n(l,g);l.charAt(0)===g.charAt(0);){s+=l.charAt(0),l=l.substring(1)+g.charAt(0),g=g.substring(1);var F=n(s,l)+n(l,g);F>=d&&(d=F,o=s,u=l,p=g)}t[a-1][1]!=o&&(o?t[a-1][1]=o:(t.splice(a-1,1),a--),t[a][1]=u,p?t[a+1][1]=p:(t.splice(a+1,1),a--))}a++}},diff_match_patch.prototype.diff_cleanupEfficiency=function(t){for(var n=!1,e=[],i=0,h="",r=0,f=!1,a=!1,s=!1,l=!1;r<t.length;)t[r][0]==DIFF_EQUAL?(t[r][1].length<this.Diff_EditCost&&(s||l)?(e[i++]=r,f=s,a=l,h=t[r][1]):(i=0,h=""),s=l=!1):(t[r][0]==DIFF_DELETE?l=!0:s=!0,h&&(f&&a&&s&&l||h.length<this.Diff_EditCost/2&&f+a+s+l==3)&&(t.splice(e[i-1],0,[DIFF_DELETE,h]),t[e[i-1]+1][0]=DIFF_INSERT,i--,h="",f&&a?(s=l=!0,i=0):(i--,r=i>0?e[i-1]:-1,s=l=!1),n=!0)),r++;n&&this.diff_cleanupMerge(t)},diff_match_patch.prototype.diff_cleanupMerge=function(t){t.push([DIFF_EQUAL,""]);for(var n,e=0,i=0,h=0,r="",f="";e<t.length;)switch(t[e][0]){case DIFF_INSERT:h++,f+=t[e][1],e++;break;case DIFF_DELETE:i++,r+=t[e][1],e++;break;case DIFF_EQUAL:i+h>1?(0!==i&&0!==h&&(n=this.diff_commonPrefix(f,r),0!==n&&(e-i-h>0&&t[e-i-h-1][0]==DIFF_EQUAL?t[e-i-h-1][1]+=f.substring(0,n):(t.splice(0,0,[DIFF_EQUAL,f.substring(0,n)]),e++),f=f.substring(n),r=r.substring(n)),n=this.diff_commonSuffix(f,r),0!==n&&(t[e][1]=f.substring(f.length-n)+t[e][1],f=f.substring(0,f.length-n),r=r.substring(0,r.length-n))),0===i?t.splice(e-i-h,i+h,[DIFF_INSERT,f]):0===h?t.splice(e-i-h,i+h,[DIFF_DELETE,r]):t.splice(e-i-h,i+h,[DIFF_DELETE,r],[DIFF_INSERT,f]),e=e-i-h+(i?1:0)+(h?1:0)+1):0!==e&&t[e-1][0]==DIFF_EQUAL?(t[e-1][1]+=t[e][1],t.splice(e,1)):e++,h=0,i=0,r="",f=""}""===t[t.length-1][1]&&t.pop();var a=!1;for(e=1;e<t.length-1;)t[e-1][0]==DIFF_EQUAL&&t[e+1][0]==DIFF_EQUAL&&(t[e][1].substring(t[e][1].length-t[e-1][1].length)==t[e-1][1]?(t[e][1]=t[e-1][1]+t[e][1].substring(0,t[e][1].length-t[e-1][1].length),t[e+1][1]=t[e-1][1]+t[e+1][1],t.splice(e-1,1),a=!0):t[e][1].substring(0,t[e+1][1].length)==t[e+1][1]&&(t[e-1][1]+=t[e+1][1],t[e][1]=t[e][1].substring(t[e+1][1].length)+t[e+1][1],t.splice(e+1,1),a=!0)),e++;a&&this.diff_cleanupMerge(t)},diff_match_patch.prototype.diff_xIndex=function(t,n){var e,i=0,h=0,r=0,f=0;for(e=0;e<t.length&&(t[e][0]!==DIFF_INSERT&&(i+=t[e][1].length),t[e][0]!==DIFF_DELETE&&(h+=t[e][1].length),!(i>n));e++)r=i,f=h;return t.length!=e&&t[e][0]===DIFF_DELETE?f:f+(n-r)},diff_match_patch.prototype.diff_prettyHtml=function(t){for(var n=[],e=0,i=/&/g,h=/</g,r=/>/g,f=/\n/g,a=0;a<t.length;a++){var s=t[a][0],l=t[a][1],g=l.replace(i,"&amp;").replace(h,"&lt;").replace(r,"&gt;").replace(f,"&para;<br>");switch(s){case DIFF_INSERT:n[a]='<ins style="background:#e6ffe6;">'+g+"</ins>";break;case DIFF_DELETE:n[a]='<del style="background:#ffe6e6;">'+g+"</del>";break;case DIFF_EQUAL:n[a]="<span>"+g+"</span>"}s!==DIFF_DELETE&&(e+=l.length)}return n.join("")},diff_match_patch.prototype.diff_text1=function(t){for(var n=[],e=0;e<t.length;e++)t[e][0]!==DIFF_INSERT&&(n[e]=t[e][1]);return n.join("")},diff_match_patch.prototype.diff_text2=function(t){for(var n=[],e=0;e<t.length;e++)t[e][0]!==DIFF_DELETE&&(n[e]=t[e][1]);return n.join("")},diff_match_patch.prototype.diff_levenshtein=function(t){for(var n=0,e=0,i=0,h=0;h<t.length;h++){var r=t[h][0],f=t[h][1];switch(r){case DIFF_INSERT:e+=f.length;break;case DIFF_DELETE:i+=f.length;break;case DIFF_EQUAL:n+=Math.max(e,i),e=0,i=0}}return n+=Math.max(e,i)},diff_match_patch.prototype.diff_toDelta=function(t){for(var n=[],e=0;e<t.length;e++)switch(t[e][0]){case DIFF_INSERT:n[e]="+"+encodeURI(t[e][1]);break;case DIFF_DELETE:n[e]="-"+t[e][1].length;break;case DIFF_EQUAL:n[e]="="+t[e][1].length}return n.join("	").replace(/%20/g," ")},diff_match_patch.prototype.diff_fromDelta=function(t,n){for(var e=[],i=0,h=0,r=n.split(/\t/g),f=0;f<r.length;f++){var a=r[f].substring(1);switch(r[f].charAt(0)){case"+":try{e[i++]=[DIFF_INSERT,decodeURI(a)]}catch(s){throw new Error("Illegal escape in diff_fromDelta: "+a)}break;case"-":case"=":var l=parseInt(a,10);if(isNaN(l)||0>l)throw new Error("Invalid number in diff_fromDelta: "+a);var g=t.substring(h,h+=l);"="==r[f].charAt(0)?e[i++]=[DIFF_EQUAL,g]:e[i++]=[DIFF_DELETE,g];break;default:if(r[f])throw new Error("Invalid diff operation in diff_fromDelta: "+r[f])}}if(h!=t.length)throw new Error("Delta length ("+h+") does not equal source text length ("+t.length+").");return e},diff_match_patch.prototype.match_main=function(t,n,e){if(null==t||null==n||null==e)throw new Error("Null input. (match_main)");return e=Math.max(0,Math.min(e,t.length)),t==n?0:t.length?t.substring(e,e+n.length)==n?e:this.match_bitap_(t,n,e):-1},diff_match_patch.prototype.match_bitap_=function(t,n,e){function i(t,i){var h=t/n.length,f=Math.abs(e-i);return r.Match_Distance?h+f/r.Match_Distance:f?1:h}if(n.length>this.Match_MaxBits)throw new Error("Pattern too long for this browser.");var h=this.match_alphabet_(n),r=this,f=this.Match_Threshold,a=t.indexOf(n,e);-1!=a&&(f=Math.min(i(0,a),f),a=t.lastIndexOf(n,e+n.length),-1!=a&&(f=Math.min(i(0,a),f)));var s=1<<n.length-1;a=-1;for(var l,g,c,_=n.length+t.length,o=0;o<n.length;o++){for(l=0,g=_;g>l;)i(o,e+g)<=f?l=g:_=g,g=Math.floor((_-l)/2+l);_=g;var u=Math.max(1,e-g+1),p=Math.min(e+g,t.length)+n.length,d=Array(p+2);d[p+1]=(1<<o)-1;for(var F=p;F>=u;F--){var E=h[t.charAt(F-1)];if(0===o?d[F]=(d[F+1]<<1|1)&E:d[F]=(d[F+1]<<1|1)&E|((c[F+1]|c[F])<<1|1)|c[F+1],d[F]&s){var D=i(o,F-1);if(f>=D){if(f=D,a=F-1,!(a>e))break;u=Math.max(1,2*e-a)}}}if(i(o+1,e)>f)break;c=d}return a},diff_match_patch.prototype.match_alphabet_=function(t){for(var n={},e=0;e<t.length;e++)n[t.charAt(e)]=0;for(var e=0;e<t.length;e++)n[t.charAt(e)]|=1<<t.length-e-1;return n},diff_match_patch.prototype.patch_addContext_=function(t,n){if(0!=n.length){for(var e=n.substring(t.start2,t.start2+t.length1),i=0;n.indexOf(e)!=n.lastIndexOf(e)&&e.length<this.Match_MaxBits-this.Patch_Margin-this.Patch_Margin;)i+=this.Patch_Margin,e=n.substring(t.start2-i,t.start2+t.length1+i);i+=this.Patch_Margin;var h=n.substring(t.start2-i,t.start2);h&&t.diffs.unshift([DIFF_EQUAL,h]);var r=n.substring(t.start2+t.length1,t.start2+t.length1+i);r&&t.diffs.push([DIFF_EQUAL,r]),t.start1-=h.length,t.start2-=h.length,t.length1+=h.length+r.length,t.length2+=h.length+r.length}},diff_match_patch.prototype.patch_make=function(t,n,e){var i,h;if("string"==typeof t&&"string"==typeof n&&"undefined"==typeof e)i=t,h=this.diff_main(i,n,!0),h.length>2&&(this.diff_cleanupSemantic(h),this.diff_cleanupEfficiency(h));else if(t&&"object"==typeof t&&"undefined"==typeof n&&"undefined"==typeof e)h=t,i=this.diff_text1(h);else if("string"==typeof t&&n&&"object"==typeof n&&"undefined"==typeof e)i=t,h=n;else{if("string"!=typeof t||"string"!=typeof n||!e||"object"!=typeof e)throw new Error("Unknown call format to patch_make.");i=t,h=e}if(0===h.length)return[];for(var r=[],f=new diff_match_patch.patch_obj,a=0,s=0,l=0,g=i,c=i,_=0;_<h.length;_++){var o=h[_][0],u=h[_][1];switch(a||o===DIFF_EQUAL||(f.start1=s,f.start2=l),o){case DIFF_INSERT:f.diffs[a++]=h[_],f.length2+=u.length,c=c.substring(0,l)+u+c.substring(l);break;case DIFF_DELETE:f.length1+=u.length,f.diffs[a++]=h[_],c=c.substring(0,l)+c.substring(l+u.length);break;case DIFF_EQUAL:u.length<=2*this.Patch_Margin&&a&&h.length!=_+1?(f.diffs[a++]=h[_],f.length1+=u.length,f.length2+=u.length):u.length>=2*this.Patch_Margin&&a&&(this.patch_addContext_(f,g),r.push(f),f=new diff_match_patch.patch_obj,a=0,g=c,s=l)}o!==DIFF_INSERT&&(s+=u.length),o!==DIFF_DELETE&&(l+=u.length)}return a&&(this.patch_addContext_(f,g),r.push(f)),r},diff_match_patch.prototype.patch_deepCopy=function(t){for(var n=[],e=0;e<t.length;e++){var i=t[e],h=new diff_match_patch.patch_obj;h.diffs=[];for(var r=0;r<i.diffs.length;r++)h.diffs[r]=i.diffs[r].slice();h.start1=i.start1,h.start2=i.start2,h.length1=i.length1,h.length2=i.length2,n[e]=h}return n},diff_match_patch.prototype.patch_apply=function(t,n){if(0==t.length)return[n,[]];t=this.patch_deepCopy(t);var e=this.patch_addPadding(t);n=e+n+e,this.patch_splitMax(t);for(var i=0,h=[],r=0;r<t.length;r++){var f,a=t[r].start2+i,s=this.diff_text1(t[r].diffs),l=-1;if(s.length>this.Match_MaxBits?(f=this.match_main(n,s.substring(0,this.Match_MaxBits),a),-1!=f&&(l=this.match_main(n,s.substring(s.length-this.Match_MaxBits),a+s.length-this.Match_MaxBits),(-1==l||f>=l)&&(f=-1))):f=this.match_main(n,s,a),-1==f)h[r]=!1,i-=t[r].length2-t[r].length1;else{h[r]=!0,i=f-a;var g;if(g=-1==l?n.substring(f,f+s.length):n.substring(f,l+this.Match_MaxBits),s==g)n=n.substring(0,f)+this.diff_text2(t[r].diffs)+n.substring(f+s.length);else{var c=this.diff_main(s,g,!1);if(s.length>this.Match_MaxBits&&this.diff_levenshtein(c)/s.length>this.Patch_DeleteThreshold)h[r]=!1;else{this.diff_cleanupSemanticLossless(c);for(var _,o=0,u=0;u<t[r].diffs.length;u++){var p=t[r].diffs[u];p[0]!==DIFF_EQUAL&&(_=this.diff_xIndex(c,o)),p[0]===DIFF_INSERT?n=n.substring(0,f+_)+p[1]+n.substring(f+_):p[0]===DIFF_DELETE&&(n=n.substring(0,f+_)+n.substring(f+this.diff_xIndex(c,o+p[1].length))),p[0]!==DIFF_DELETE&&(o+=p[1].length)}}}}}return n=n.substring(e.length,n.length-e.length),[n,h]},diff_match_patch.prototype.patch_addPadding=function(t){for(var n=this.Patch_Margin,e="",i=1;n>=i;i++)e+=String.fromCharCode(i);for(var i=0;i<t.length;i++)t[i].start1+=n,t[i].start2+=n;var h=t[0],r=h.diffs;if(0==r.length||r[0][0]!=DIFF_EQUAL)r.unshift([DIFF_EQUAL,e]),h.start1-=n,h.start2-=n,h.length1+=n,h.length2+=n;else if(n>r[0][1].length){var f=n-r[0][1].length;r[0][1]=e.substring(r[0][1].length)+r[0][1],h.start1-=f,h.start2-=f,h.length1+=f,h.length2+=f}if(h=t[t.length-1],r=h.diffs,0==r.length||r[r.length-1][0]!=DIFF_EQUAL)r.push([DIFF_EQUAL,e]),h.length1+=n,h.length2+=n;else if(n>r[r.length-1][1].length){var f=n-r[r.length-1][1].length;r[r.length-1][1]+=e.substring(0,f),h.length1+=f,h.length2+=f}return e},diff_match_patch.prototype.patch_splitMax=function(t){for(var n=this.Match_MaxBits,e=0;e<t.length;e++)if(t[e].length1>n){var i=t[e];t.splice(e--,1);for(var h=i.start1,r=i.start2,f="";0!==i.diffs.length;){var a=new diff_match_patch.patch_obj,s=!0;for(a.start1=h-f.length,a.start2=r-f.length,""!==f&&(a.length1=a.length2=f.length,a.diffs.push([DIFF_EQUAL,f]));0!==i.diffs.length&&a.length1<n-this.Patch_Margin;){var l=i.diffs[0][0],g=i.diffs[0][1];l===DIFF_INSERT?(a.length2+=g.length,r+=g.length,a.diffs.push(i.diffs.shift()),s=!1):l===DIFF_DELETE&&1==a.diffs.length&&a.diffs[0][0]==DIFF_EQUAL&&g.length>2*n?(a.length1+=g.length,h+=g.length,s=!1,a.diffs.push([l,g]),i.diffs.shift()):(g=g.substring(0,n-a.length1-this.Patch_Margin),a.length1+=g.length,h+=g.length,l===DIFF_EQUAL?(a.length2+=g.length,r+=g.length):s=!1,a.diffs.push([l,g]),g==i.diffs[0][1]?i.diffs.shift():i.diffs[0][1]=i.diffs[0][1].substring(g.length))}f=this.diff_text2(a.diffs),f=f.substring(f.length-this.Patch_Margin);var c=this.diff_text1(i.diffs).substring(0,this.Patch_Margin);""!==c&&(a.length1+=c.length,a.length2+=c.length,0!==a.diffs.length&&a.diffs[a.diffs.length-1][0]===DIFF_EQUAL?a.diffs[a.diffs.length-1][1]+=c:a.diffs.push([DIFF_EQUAL,c])),s||t.splice(++e,0,a)}}},diff_match_patch.prototype.patch_toText=function(t){for(var n=[],e=0;e<t.length;e++)n[e]=t[e];return n.join("")},diff_match_patch.prototype.patch_fromText=function(t){var n=[];if(!t)return n;for(var e=t.split("\n"),i=0,h=/^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;i<e.length;){var r=e[i].match(h);if(!r)throw new Error("Invalid patch string: "+e[i]);var f=new diff_match_patch.patch_obj;for(n.push(f),f.start1=parseInt(r[1],10),""===r[2]?(f.start1--,f.length1=1):"0"==r[2]?f.length1=0:(f.start1--,f.length1=parseInt(r[2],10)),f.start2=parseInt(r[3],10),""===r[4]?(f.start2--,f.length2=1):"0"==r[4]?f.length2=0:(f.start2--,f.length2=parseInt(r[4],10)),i++;i<e.length;){var a=e[i].charAt(0);try{var s=decodeURI(e[i].substring(1))}catch(l){throw new Error("Illegal escape in patch_fromText: "+s)}if("-"==a)f.diffs.push([DIFF_DELETE,s]);else if("+"==a)f.diffs.push([DIFF_INSERT,s]);else if(" "==a)f.diffs.push([DIFF_EQUAL,s]);else{if("@"==a)break;if(""!==a)throw new Error('Invalid patch mode "'+a+'" in: '+s)}i++}}return n},diff_match_patch.patch_obj=function(){this.diffs=[],this.start1=null,this.start2=null,this.length1=0,this.length2=0},diff_match_patch.patch_obj.prototype.toString=function(){var t,n;t=0===this.length1?this.start1+",0":1==this.length1?this.start1+1:this.start1+1+","+this.length1,n=0===this.length2?this.start2+",0":1==this.length2?this.start2+1:this.start2+1+","+this.length2;for(var e,i=["@@ -"+t+" +"+n+" @@\n"],h=0;h<this.diffs.length;h++){switch(this.diffs[h][0]){case DIFF_INSERT:e="+";break;case DIFF_DELETE:e="-";break;case DIFF_EQUAL:e=" "}i[h+1]=e+encodeURI(this.diffs[h][1])+"\n"}return i.join("").replace(/%20/g," ")},this.diff_match_patch=diff_match_patch,this.DIFF_DELETE=DIFF_DELETE,this.DIFF_INSERT=DIFF_INSERT,this.DIFF_EQUAL=DIFF_EQUAL;
        },{}],3:[function(require,module,exports){
            function cloneRegExp(r){var e=/^\/(.*)\/([gimyu]*)$/.exec(r.toString());return new RegExp(e[1],e[2])}function clone(r){if("object"!=typeof r)return r;if(null===r)return null;if(isArray(r))return r.map(clone);if(r instanceof Date)return new Date(r.getTime());if(r instanceof RegExp)return cloneRegExp(r);var e={};for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=clone(r[n]));return e}var isArray="function"==typeof Array.isArray?Array.isArray:function(r){return r instanceof Array};module.exports=clone;
        },{}],4:[function(require,module,exports){
            var Pipe=require("../pipe").Pipe,Context=function(){};Context.prototype.setResult=function(t){return this.result=t,this.hasResult=!0,this},Context.prototype.exit=function(){return this.exiting=!0,this},Context.prototype.switchTo=function(t,e){return"string"==typeof t||t instanceof Pipe?this.nextPipe=t:(this.next=t,e&&(this.nextPipe=e)),this},Context.prototype.push=function(t,e){return t.parent=this,"undefined"!=typeof e&&(t.childName=e),t.root=this.root||this,t.options=t.options||this.options,this.children?(this.children[this.children.length-1].next=t,this.children.push(t)):(this.children=[t],this.nextAfterChildren=this.next||null,this.next=t),t.next=this,this},exports.Context=Context;
        },{"../pipe":18}],5:[function(require,module,exports){
            var Context=require("./context").Context,defaultClone=require("../clone"),DiffContext=function(t,e){this.left=t,this.right=e,this.pipe="diff"};DiffContext.prototype=new Context,DiffContext.prototype.setResult=function(t){if(this.options.cloneDiffValues&&"object"==typeof t){var e="function"==typeof this.options.cloneDiffValues?this.options.cloneDiffValues:defaultClone;"object"==typeof t[0]&&(t[0]=e(t[0])),"object"==typeof t[1]&&(t[1]=e(t[1]))}return Context.prototype.setResult.apply(this,arguments)},exports.DiffContext=DiffContext;
        },{"../clone":3,"./context":4}],6:[function(require,module,exports){
            var Context=require("./context").Context,PatchContext=function(t,e){this.left=t,this.delta=e,this.pipe="patch"};PatchContext.prototype=new Context,exports.PatchContext=PatchContext;
        },{"./context":4}],7:[function(require,module,exports){
            var Context=require("./context").Context,ReverseContext=function(e){this.delta=e,this.pipe="reverse"};ReverseContext.prototype=new Context,exports.ReverseContext=ReverseContext;
        },{"./context":4}],8:[function(require,module,exports){
            module.exports=function(d,e){var t;return"string"==typeof e&&(t=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d*))?(Z|([+\-])(\d{2}):(\d{2}))$/.exec(e))?new Date(Date.UTC(+t[1],+t[2]-1,+t[3],+t[4],+t[5],+t[6],+(t[7]||0))):e};
        },{}],9:[function(require,module,exports){
            var Processor=require("./processor").Processor,Pipe=require("./pipe").Pipe,DiffContext=require("./contexts/diff").DiffContext,PatchContext=require("./contexts/patch").PatchContext,ReverseContext=require("./contexts/reverse").ReverseContext,clone=require("./clone"),trivial=require("./filters/trivial"),nested=require("./filters/nested"),arrays=require("./filters/arrays"),dates=require("./filters/dates"),texts=require("./filters/texts"),DiffPatcher=function(e){this.processor=new Processor(e),this.processor.pipe(new Pipe("diff").append(nested.collectChildrenDiffFilter,trivial.diffFilter,dates.diffFilter,texts.diffFilter,nested.objectsDiffFilter,arrays.diffFilter).shouldHaveResult()),this.processor.pipe(new Pipe("patch").append(nested.collectChildrenPatchFilter,arrays.collectChildrenPatchFilter,trivial.patchFilter,texts.patchFilter,nested.patchFilter,arrays.patchFilter).shouldHaveResult()),this.processor.pipe(new Pipe("reverse").append(nested.collectChildrenReverseFilter,arrays.collectChildrenReverseFilter,trivial.reverseFilter,texts.reverseFilter,nested.reverseFilter,arrays.reverseFilter).shouldHaveResult())};DiffPatcher.prototype.options=function(){return this.processor.options.apply(this.processor,arguments)},DiffPatcher.prototype.diff=function(e,r){return this.processor.process(new DiffContext(e,r))},DiffPatcher.prototype.patch=function(e,r){return this.processor.process(new PatchContext(e,r))},DiffPatcher.prototype.reverse=function(e){return this.processor.process(new ReverseContext(e))},DiffPatcher.prototype.unpatch=function(e,r){return this.patch(e,this.reverse(r))},DiffPatcher.prototype.clone=function(e){return clone(e)},exports.DiffPatcher=DiffPatcher;
        },{"./clone":3,"./contexts/diff":5,"./contexts/patch":6,"./contexts/reverse":7,"./filters/arrays":11,"./filters/dates":12,"./filters/nested":14,"./filters/texts":15,"./filters/trivial":16,"./pipe":18,"./processor":19}],10:[function(require,module,exports){
            exports.isBrowser="undefined"!=typeof window;
        },{}],11:[function(require,module,exports){
            function arraysHaveMatchByRef(e,t,r,i){for(var a=0;r>a;a++)for(var n=e[a],l=0;i>l;l++){var s=t[l];if(a!==l&&n===s)return!0}}function matchItems(e,t,r,i,a){var n=e[r],l=t[i];if(n===l)return!0;if("object"!=typeof n||"object"!=typeof l)return!1;var s=a.objectHash;if(!s)return a.matchByPosition&&r===i;var o,f;return"number"==typeof r?(a.hashCache1=a.hashCache1||[],o=a.hashCache1[r],"undefined"==typeof o&&(a.hashCache1[r]=o=s(n,r))):o=s(n),"undefined"==typeof o?!1:("number"==typeof i?(a.hashCache2=a.hashCache2||[],f=a.hashCache2[i],"undefined"==typeof f&&(a.hashCache2[i]=f=s(l,i))):f=s(l),"undefined"==typeof f?!1:o===f)}var DiffContext=require("../contexts/diff").DiffContext,PatchContext=require("../contexts/patch").PatchContext,ReverseContext=require("../contexts/reverse").ReverseContext,lcs=require("./lcs"),ARRAY_MOVE=3,isArray="function"==typeof Array.isArray?Array.isArray:function(e){return e instanceof Array},arrayIndexOf="function"==typeof Array.prototype.indexOf?function(e,t){return e.indexOf(t)}:function(e,t){for(var r=e.length,i=0;r>i;i++)if(e[i]===t)return i;return-1},diffFilter=function(e){if(e.leftIsArray){var t,r,i,a,n={objectHash:e.options&&e.options.objectHash,matchByPosition:e.options&&e.options.matchByPosition},l=0,s=0,o=e.left,f=e.right,c=o.length,h=f.length;for(c>0&&h>0&&!n.objectHash&&"boolean"!=typeof n.matchByPosition&&(n.matchByPosition=!arraysHaveMatchByRef(o,f,c,h));c>l&&h>l&&matchItems(o,f,l,l,n);)t=l,a=new DiffContext(e.left[t],e.right[t]),e.push(a,t),l++;for(;c>s+l&&h>s+l&&matchItems(o,f,c-1-s,h-1-s,n);)r=c-1-s,i=h-1-s,a=new DiffContext(e.left[r],e.right[i]),e.push(a,i),s++;var u;if(l+s===c){if(c===h)return void e.setResult(void 0).exit();for(u=u||{_t:"a"},t=l;h-s>t;t++)u[t]=[f[t]];return void e.setResult(u).exit()}if(l+s===h){for(u=u||{_t:"a"},t=l;c-s>t;t++)u["_"+t]=[o[t],0,0];return void e.setResult(u).exit()}delete n.hashCache1,delete n.hashCache2;var d=o.slice(l,c-s),v=f.slice(l,h-s),p=lcs.get(d,v,matchItems,n),y=[];for(u=u||{_t:"a"},t=l;c-s>t;t++)arrayIndexOf(p.indices1,t-l)<0&&(u["_"+t]=[o[t],0,0],y.push(t));var x=!0;e.options&&e.options.arrays&&e.options.arrays.detectMove===!1&&(x=!1);var m=!1;e.options&&e.options.arrays&&e.options.arrays.includeValueOnMove&&(m=!0);var C=y.length;for(t=l;h-s>t;t++){var R=arrayIndexOf(p.indices2,t-l);if(0>R){var A=!1;if(x&&C>0)for(var _=0;C>_;_++)if(r=y[_],matchItems(d,v,r-l,t-l,n)){u["_"+r].splice(1,2,t,ARRAY_MOVE),m||(u["_"+r][0]=""),i=t,a=new DiffContext(e.left[r],e.right[i]),e.push(a,i),y.splice(_,1),A=!0;break}A||(u[t]=[f[t]])}else r=p.indices1[R]+l,i=p.indices2[R]+l,a=new DiffContext(e.left[r],e.right[i]),e.push(a,i)}e.setResult(u).exit()}};diffFilter.filterName="arrays";var compare={numerically:function(e,t){return e-t},numericallyBy:function(e){return function(t,r){return t[e]-r[e]}}},patchFilter=function(e){if(e.nested&&"a"===e.delta._t){var t,r,i=e.delta,a=e.left,n=[],l=[],s=[];for(t in i)if("_t"!==t)if("_"===t[0]){if(0!==i[t][2]&&i[t][2]!==ARRAY_MOVE)throw new Error("only removal or move can be applied at original array indices, invalid diff type: "+i[t][2]);n.push(parseInt(t.slice(1),10))}else 1===i[t].length?l.push({index:parseInt(t,10),value:i[t][0]}):s.push({index:parseInt(t,10),delta:i[t]});for(n=n.sort(compare.numerically),t=n.length-1;t>=0;t--){r=n[t];var o=i["_"+r],f=a.splice(r,1)[0];o[2]===ARRAY_MOVE&&l.push({index:o[1],value:f})}l=l.sort(compare.numericallyBy("index"));var c=l.length;for(t=0;c>t;t++){var h=l[t];a.splice(h.index,0,h.value)}var u,d=s.length;if(d>0)for(t=0;d>t;t++){var v=s[t];u=new PatchContext(e.left[v.index],v.delta),e.push(u,v.index)}return e.children?void e.exit():void e.setResult(e.left).exit()}};patchFilter.filterName="arrays";var collectChildrenPatchFilter=function(e){if(e&&e.children&&"a"===e.delta._t){for(var t,r=e.children.length,i=0;r>i;i++)t=e.children[i],e.left[t.childName]=t.result;e.setResult(e.left).exit()}};collectChildrenPatchFilter.filterName="arraysCollectChildren";var reverseFilter=function(e){if(!e.nested)return void(e.delta[2]===ARRAY_MOVE&&(e.newName="_"+e.delta[1],e.setResult([e.delta[0],parseInt(e.childName.substr(1),10),ARRAY_MOVE]).exit()));if("a"===e.delta._t){var t,r;for(t in e.delta)"_t"!==t&&(r=new ReverseContext(e.delta[t]),e.push(r,t));e.exit()}};reverseFilter.filterName="arrays";var reverseArrayDeltaIndex=function(e,t,r){if("string"==typeof t&&"_"===t[0])return parseInt(t.substr(1),10);if(isArray(r)&&0===r[2])return"_"+t;var i=+t;for(var a in e){var n=e[a];if(isArray(n))if(n[2]===ARRAY_MOVE){var l=parseInt(a.substr(1),10),s=n[1];if(s===+t)return l;i>=l&&s>i?i++:l>=i&&i>s&&i--}else if(0===n[2]){var o=parseInt(a.substr(1),10);i>=o&&i++}else 1===n.length&&i>=a&&i--}return i},collectChildrenReverseFilter=function(e){if(e&&e.children&&"a"===e.delta._t){for(var t,r=e.children.length,i={_t:"a"},a=0;r>a;a++){t=e.children[a];var n=t.newName;"undefined"==typeof n&&(n=reverseArrayDeltaIndex(e.delta,t.childName,t.result)),i[n]!==t.result&&(i[n]=t.result)}e.setResult(i).exit()}};collectChildrenReverseFilter.filterName="arraysCollectChildren",exports.diffFilter=diffFilter,exports.patchFilter=patchFilter,exports.collectChildrenPatchFilter=collectChildrenPatchFilter,exports.reverseFilter=reverseFilter,exports.collectChildrenReverseFilter=collectChildrenReverseFilter;
        },{"../contexts/diff":5,"../contexts/patch":6,"../contexts/reverse":7,"./lcs":13}],12:[function(require,module,exports){
            var diffFilter=function(t){t.left instanceof Date?(t.right instanceof Date?t.left.getTime()!==t.right.getTime()?t.setResult([t.left,t.right]):t.setResult(void 0):t.setResult([t.left,t.right]),t.exit()):t.right instanceof Date&&t.setResult([t.left,t.right]).exit()};diffFilter.filterName="dates",exports.diffFilter=diffFilter;
        },{}],13:[function(require,module,exports){
            var defaultMatch=function(t,e,n,r){return t[n]===e[r]},lengthMatrix=function(t,e,n,r){var c,a,i=t.length,u=e.length,f=[i+1];for(c=0;i+1>c;c++)for(f[c]=[u+1],a=0;u+1>a;a++)f[c][a]=0;for(f.match=n,c=1;i+1>c;c++)for(a=1;u+1>a;a++)n(t,e,c-1,a-1,r)?f[c][a]=f[c-1][a-1]+1:f[c][a]=Math.max(f[c-1][a],f[c][a-1]);return f},backtrack=function(t,e,n,r,c,a){if(0===r||0===c)return{sequence:[],indices1:[],indices2:[]};if(t.match(e,n,r-1,c-1,a)){var i=backtrack(t,e,n,r-1,c-1,a);return i.sequence.push(e[r-1]),i.indices1.push(r-1),i.indices2.push(c-1),i}return t[r][c-1]>t[r-1][c]?backtrack(t,e,n,r,c-1,a):backtrack(t,e,n,r-1,c,a)},get=function(t,e,n,r){r=r||{};var c=lengthMatrix(t,e,n||defaultMatch,r),a=backtrack(c,t,e,t.length,e.length,r);return"string"==typeof t&&"string"==typeof e&&(a.sequence=a.sequence.join("")),a};exports.get=get;
        },{}],14:[function(require,module,exports){
            var DiffContext=require("../contexts/diff").DiffContext,PatchContext=require("../contexts/patch").PatchContext,ReverseContext=require("../contexts/reverse").ReverseContext,collectChildrenDiffFilter=function(e){if(e&&e.children){for(var t,l=e.children.length,r=e.result,i=0;l>i;i++)t=e.children[i],"undefined"!=typeof t.result&&(r=r||{},r[t.childName]=t.result);r&&e.leftIsArray&&(r._t="a"),e.setResult(r).exit()}};collectChildrenDiffFilter.filterName="collectChildren";var objectsDiffFilter=function(e){if(!e.leftIsArray&&"object"===e.leftType){var t,l,r=e.options.propertyFilter;for(t in e.left)Object.prototype.hasOwnProperty.call(e.left,t)&&(r&&!r(t,e)||(l=new DiffContext(e.left[t],e.right[t]),e.push(l,t)));for(t in e.right)Object.prototype.hasOwnProperty.call(e.right,t)&&(r&&!r(t,e)||"undefined"==typeof e.left[t]&&(l=new DiffContext(void 0,e.right[t]),e.push(l,t)));return e.children&&0!==e.children.length?void e.exit():void e.setResult(void 0).exit()}};objectsDiffFilter.filterName="objects";var patchFilter=function(e){if(e.nested&&!e.delta._t){var t,l;for(t in e.delta)l=new PatchContext(e.left[t],e.delta[t]),e.push(l,t);e.exit()}};patchFilter.filterName="objects";var collectChildrenPatchFilter=function(e){if(e&&e.children&&!e.delta._t){for(var t,l=e.children.length,r=0;l>r;r++)t=e.children[r],Object.prototype.hasOwnProperty.call(e.left,t.childName)&&void 0===t.result?delete e.left[t.childName]:e.left[t.childName]!==t.result&&(e.left[t.childName]=t.result);e.setResult(e.left).exit()}};collectChildrenPatchFilter.filterName="collectChildren";var reverseFilter=function(e){if(e.nested&&!e.delta._t){var t,l;for(t in e.delta)l=new ReverseContext(e.delta[t]),e.push(l,t);e.exit()}};reverseFilter.filterName="objects";var collectChildrenReverseFilter=function(e){if(e&&e.children&&!e.delta._t){for(var t,l=e.children.length,r={},i=0;l>i;i++)t=e.children[i],r[t.childName]!==t.result&&(r[t.childName]=t.result);e.setResult(r).exit()}};collectChildrenReverseFilter.filterName="collectChildren",exports.collectChildrenDiffFilter=collectChildrenDiffFilter,exports.objectsDiffFilter=objectsDiffFilter,exports.patchFilter=patchFilter,exports.collectChildrenPatchFilter=collectChildrenPatchFilter,exports.reverseFilter=reverseFilter,exports.collectChildrenReverseFilter=collectChildrenReverseFilter;
        },{"../contexts/diff":5,"../contexts/patch":6,"../contexts/reverse":7}],15:[function(require,module,exports){
            var TEXT_DIFF=2,DEFAULT_MIN_LENGTH=60,cachedDiffPatch=null,getDiffMatchPatch=function(t){if(!cachedDiffPatch){var e;if("undefined"!=typeof diff_match_patch)e="function"==typeof diff_match_patch?new diff_match_patch:new diff_match_patch.diff_match_patch;else if("function"==typeof require)try{var i="diff_match_patch_uncompressed",f=require("../../public/external/"+i);e=new f.diff_match_patch}catch(r){e=null}if(!e){if(!t)return null;var a=new Error("text diff_match_patch library not found");throw a.diff_match_patch_not_found=!0,a}cachedDiffPatch={diff:function(t,i){return e.patch_toText(e.patch_make(t,i))},patch:function(t,i){for(var f=e.patch_apply(e.patch_fromText(i),t),r=0;r<f[1].length;r++)if(!f[1][r]){var a=new Error("text patch failed");a.textPatchFailed=!0}return f[0]}}}return cachedDiffPatch},diffFilter=function(t){if("string"===t.leftType){var e=t.options&&t.options.textDiff&&t.options.textDiff.minLength||DEFAULT_MIN_LENGTH;if(t.left.length<e||t.right.length<e)return void t.setResult([t.left,t.right]).exit();var i=getDiffMatchPatch();if(!i)return void t.setResult([t.left,t.right]).exit();var f=i.diff;t.setResult([f(t.left,t.right),0,TEXT_DIFF]).exit()}};diffFilter.filterName="texts";var patchFilter=function(t){if(!t.nested&&t.delta[2]===TEXT_DIFF){var e=getDiffMatchPatch(!0).patch;t.setResult(e(t.left,t.delta[0])).exit()}};patchFilter.filterName="texts";var textDeltaReverse=function(t){var e,i,f,r,a,c,l,n,h=null,d=/^@@ +\-(\d+),(\d+) +\+(\d+),(\d+) +@@$/;for(f=t.split("\n"),e=0,i=f.length;i>e;e++){r=f[e];var o=r.slice(0,1);"@"===o?(h=d.exec(r),c=e,l=null,n=null,f[c]="@@ -"+h[3]+","+h[4]+" +"+h[1]+","+h[2]+" @@"):"+"===o?(l=e,f[e]="-"+f[e].slice(1),"+"===f[e-1].slice(0,1)&&(a=f[e],f[e]=f[e-1],f[e-1]=a)):"-"===o&&(n=e,f[e]="+"+f[e].slice(1))}return f.join("\n")},reverseFilter=function(t){t.nested||t.delta[2]===TEXT_DIFF&&t.setResult([textDeltaReverse(t.delta[0]),0,TEXT_DIFF]).exit()};reverseFilter.filterName="texts",exports.diffFilter=diffFilter,exports.patchFilter=patchFilter,exports.reverseFilter=reverseFilter;
        },{}],16:[function(require,module,exports){
            var isArray="function"==typeof Array.isArray?Array.isArray:function(e){return e instanceof Array},diffFilter=function(e){if(e.left===e.right)return void e.setResult(void 0).exit();if("undefined"==typeof e.left){if("function"==typeof e.right)throw new Error("functions are not supported");return void e.setResult([e.right]).exit()}if("undefined"==typeof e.right)return void e.setResult([e.left,0,0]).exit();if("function"==typeof e.left||"function"==typeof e.right)throw new Error("functions are not supported");if(e.leftType=null===e.left?"null":typeof e.left,e.rightType=null===e.right?"null":typeof e.right,e.leftType!==e.rightType)return void e.setResult([e.left,e.right]).exit();if("boolean"===e.leftType||"number"===e.leftType)return void e.setResult([e.left,e.right]).exit();if("object"===e.leftType&&(e.leftIsArray=isArray(e.left)),"object"===e.rightType&&(e.rightIsArray=isArray(e.right)),e.leftIsArray!==e.rightIsArray)return void e.setResult([e.left,e.right]).exit();if(e.left instanceof RegExp){if(!(e.right instanceof RegExp))return void e.setResult([e.left,e.right]).exit();e.setResult([e.left.toString(),e.right.toString()]).exit()}};diffFilter.filterName="trivial";var patchFilter=function(e){if("undefined"==typeof e.delta)return void e.setResult(e.left).exit();if(e.nested=!isArray(e.delta),!e.nested){if(1===e.delta.length)return void e.setResult(e.delta[0]).exit();if(2===e.delta.length){if(e.left instanceof RegExp){var t=/^\/(.*)\/([gimyu]+)$/.exec(e.delta[1]);if(t)return void e.setResult(new RegExp(t[1],t[2])).exit()}return void e.setResult(e.delta[1]).exit()}return 3===e.delta.length&&0===e.delta[2]?void e.setResult(void 0).exit():void 0}};patchFilter.filterName="trivial";var reverseFilter=function(e){return"undefined"==typeof e.delta?void e.setResult(e.delta).exit():(e.nested=!isArray(e.delta),e.nested?void 0:1===e.delta.length?void e.setResult([e.delta[0],0,0]).exit():2===e.delta.length?void e.setResult([e.delta[1],e.delta[0]]).exit():3===e.delta.length&&0===e.delta[2]?void e.setResult([e.delta[0]]).exit():void 0)};reverseFilter.filterName="trivial",exports.diffFilter=diffFilter,exports.patchFilter=patchFilter,exports.reverseFilter=reverseFilter;
        },{}],17:[function(require,module,exports){
            var environment=require("./environment"),DiffPatcher=require("./diffpatcher").DiffPatcher;exports.DiffPatcher=DiffPatcher,exports.create=function(e){return new DiffPatcher(e)},exports.dateReviver=require("./date-reviver");var defaultInstance;if(exports.diff=function(){return defaultInstance||(defaultInstance=new DiffPatcher),defaultInstance.diff.apply(defaultInstance,arguments)},exports.patch=function(){return defaultInstance||(defaultInstance=new DiffPatcher),defaultInstance.patch.apply(defaultInstance,arguments)},exports.unpatch=function(){return defaultInstance||(defaultInstance=new DiffPatcher),defaultInstance.unpatch.apply(defaultInstance,arguments)},exports.reverse=function(){return defaultInstance||(defaultInstance=new DiffPatcher),defaultInstance.reverse.apply(defaultInstance,arguments)},exports.clone=function(){return defaultInstance||(defaultInstance=new DiffPatcher),defaultInstance.clone.apply(defaultInstance,arguments)},environment.isBrowser)exports.homepage="https://github.com/benjamine/jsondiffpatch",exports.version="0.2.5";else{var packageInfoModuleName="../package.json",packageInfo=require(packageInfoModuleName);exports.homepage=packageInfo.homepage,exports.version=packageInfo.version;var formatterModuleName="./formatters",formatters=require(formatterModuleName);exports.formatters=formatters,exports.console=formatters.console}
        },{"./date-reviver":8,"./diffpatcher":9,"./environment":10}],18:[function(require,module,exports){
            var Pipe=function(t){this.name=t,this.filters=[]};Pipe.prototype.process=function(t){if(!this.processor)throw new Error("add this pipe to a processor before using it");for(var e=this.debug,r=this.filters.length,i=t,s=0;r>s;s++){var o=this.filters[s];if(e&&this.log("filter: "+o.filterName),o(i),"object"==typeof i&&i.exiting){i.exiting=!1;break}}!i.next&&this.resultCheck&&this.resultCheck(i)},Pipe.prototype.log=function(t){console.log("[jsondiffpatch] "+this.name+" pipe, "+t)},Pipe.prototype.append=function(){return this.filters.push.apply(this.filters,arguments),this},Pipe.prototype.prepend=function(){return this.filters.unshift.apply(this.filters,arguments),this},Pipe.prototype.indexOf=function(t){if(!t)throw new Error("a filter name is required");for(var e=0;e<this.filters.length;e++){var r=this.filters[e];if(r.filterName===t)return e}throw new Error("filter not found: "+t)},Pipe.prototype.list=function(){for(var t=[],e=0;e<this.filters.length;e++){var r=this.filters[e];t.push(r.filterName)}return t},Pipe.prototype.after=function(t){var e=this.indexOf(t),r=Array.prototype.slice.call(arguments,1);if(!r.length)throw new Error("a filter is required");return r.unshift(e+1,0),Array.prototype.splice.apply(this.filters,r),this},Pipe.prototype.before=function(t){var e=this.indexOf(t),r=Array.prototype.slice.call(arguments,1);if(!r.length)throw new Error("a filter is required");return r.unshift(e,0),Array.prototype.splice.apply(this.filters,r),this},Pipe.prototype.replace=function(t){var e=this.indexOf(t),r=Array.prototype.slice.call(arguments,1);if(!r.length)throw new Error("a filter is required");return r.unshift(e,1),Array.prototype.splice.apply(this.filters,r),this},Pipe.prototype.remove=function(t){var e=this.indexOf(t);return this.filters.splice(e,1),this},Pipe.prototype.clear=function(){return this.filters.length=0,this},Pipe.prototype.shouldHaveResult=function(t){if(t===!1)return void(this.resultCheck=null);if(!this.resultCheck){var e=this;return this.resultCheck=function(t){if(!t.hasResult){console.log(t);var r=new Error(e.name+" failed");throw r.noResult=!0,r}},this}},exports.Pipe=Pipe;
        },{}],19:[function(require,module,exports){
            var Processor=function(e){this.selfOptions=e||{},this.pipes={}};Processor.prototype.options=function(e){return e&&(this.selfOptions=e),this.selfOptions},Processor.prototype.pipe=function(e,t){if("string"==typeof e){if("undefined"==typeof t)return this.pipes[e];this.pipes[e]=t}if(e&&e.name){if(t=e,t.processor===this)return t;this.pipes[t.name]=t}return t.processor=this,t},Processor.prototype.process=function(e,t){var s=e;s.options=this.options();for(var r,o,i=t||e.pipe||"default";i;)"undefined"!=typeof s.nextAfterChildren&&(s.next=s.nextAfterChildren,s.nextAfterChildren=null),"string"==typeof i&&(i=this.pipe(i)),i.process(s),o=s,r=i,i=null,s&&s.next&&(s=s.next,i=o.nextPipe||s.pipe||r);return s.hasResult?s.result:void 0},exports.Processor=Processor;
        },{}]},{},[1])(1)
    })();

    // inline formatter
    var formatter = (function () {
        var define, module, exports;
        return (function e(t, n, r) {
            function s(o, u) {
                if (!n[o]) {
                    if (!t[o]) {
                        var a = typeof require == "function" && require;
                        if (!u && a) return a(o, !0);
                        if (i) return i(o, !0);
                        var f = new Error("Cannot find module '" + o + "'");
                        throw f.code = "MODULE_NOT_FOUND", f
                    }
                    var l = n[o] = {exports: {}};
                    t[o][0].call(l.exports, function (e) {
                        var n = t[o][1][e];
                        return s(n ? n : e)
                    }, l, l.exports, e, t, n, r)
                }
                return n[o].exports
            }

            var i = typeof require == "function" && require;
            for (var o = 0; o < r.length; o++) s(r[o]);
            return s
        })({
            1: [function (require, module, exports) {
                module.exports = require("./formatters");
            }, {"./formatters": 6}],
            2: [function (require, module, exports) {
                exports.isBrowser = "undefined" != typeof window;
            }, {}],
            3: [function (require, module, exports) {
                var base = require("./base"), BaseFormatter = base.BaseFormatter, AnnotatedFormatter = function () {
                    this.includeMoveDestinations = !1
                };
                AnnotatedFormatter.prototype = new BaseFormatter, AnnotatedFormatter.prototype.prepareContext = function (t) {
                    BaseFormatter.prototype.prepareContext.call(this, t), t.indent = function (t) {
                        this.indentLevel = (this.indentLevel || 0) + ("undefined" == typeof t ? 1 : t), this.indentPad = new Array(this.indentLevel + 1).join("&nbsp;&nbsp;")
                    }, t.row = function (e, n) {
                        t.out('<tr><td style="white-space: nowrap;"><pre class="jsondiffpatch-annotated-indent" style="display: inline-block">'), t.out(t.indentPad), t.out('</pre><pre style="display: inline-block">'), t.out(e), t.out('</pre></td><td class="jsondiffpatch-delta-note"><div>'), t.out(n), t.out("</div></td></tr>")
                    }
                }, AnnotatedFormatter.prototype.typeFormattterErrorFormatter = function (t, e) {
                    t.row("", '<pre class="jsondiffpatch-error">' + e + "</pre>")
                }, AnnotatedFormatter.prototype.formatTextDiffString = function (t, e) {
                    var n = this.parseTextDiff(e);
                    t.out('<ul class="jsondiffpatch-textdiff">');
                    for (var o = 0, r = n.length; r > o; o++) {
                        var a = n[o];
                        t.out('<li><div class="jsondiffpatch-textdiff-location"><span class="jsondiffpatch-textdiff-line-number">' + a.location.line + '</span><span class="jsondiffpatch-textdiff-char">' + a.location.chr + '</span></div><div class="jsondiffpatch-textdiff-line">');
                        for (var i = a.pieces, d = 0, p = i.length; p > d; d++) {
                            var f = i[d];
                            t.out('<span class="jsondiffpatch-textdiff-' + f.type + '">' + f.text + "</span>")
                        }
                        t.out("</div></li>")
                    }
                    t.out("</ul>")
                }, AnnotatedFormatter.prototype.rootBegin = function (t, e, n) {
                    t.out('<table class="jsondiffpatch-annotated-delta">'), "node" === e && (t.row("{"), t.indent()), "array" === n && t.row('"_t": "a",', "Array delta (member names indicate array indices)")
                }, AnnotatedFormatter.prototype.rootEnd = function (t, e) {
                    "node" === e && (t.indent(-1), t.row("}")), t.out("</table>")
                }, AnnotatedFormatter.prototype.nodeBegin = function (t, e, n, o, r) {
                    t.row("&quot;" + e + "&quot;: {"), "node" === o && t.indent(), "array" === r && t.row('"_t": "a",', "Array delta (member names indicate array indices)")
                }, AnnotatedFormatter.prototype.nodeEnd = function (t, e, n, o, r, a) {
                    "node" === o && t.indent(-1), t.row("}" + (a ? "" : ","))
                }, AnnotatedFormatter.prototype.format_unchanged = function () {
                }, AnnotatedFormatter.prototype.format_movedestination = function () {
                }, AnnotatedFormatter.prototype.format_node = function (t, e, n) {
                    this.formatDeltaChildren(t, e, n)
                };
                var wrapPropertyName = function (t) {
                    return '<pre style="display:inline-block">&quot;' + t + "&quot;</pre>"
                }, deltaAnnotations = {
                    added: function (t, e, n, o) {
                        var r = " <pre>([newValue])</pre>";
                        return "undefined" == typeof o ? "new value" + r : "number" == typeof o ? "insert at index " + o + r : "add property " + wrapPropertyName(o) + r
                    }, modified: function (t, e, n, o) {
                        var r = " <pre>([previousValue, newValue])</pre>";
                        return "undefined" == typeof o ? "modify value" + r : "number" == typeof o ? "modify at index " + o + r : "modify property " + wrapPropertyName(o) + r
                    }, deleted: function (t, e, n, o) {
                        var r = " <pre>([previousValue, 0, 0])</pre>";
                        return "undefined" == typeof o ? "delete value" + r : "number" == typeof o ? "remove index " + o + r : "delete property " + wrapPropertyName(o) + r
                    }, moved: function (t, e, n, o) {
                        return 'move from <span title="(position to remove at original state)">index ' + o + '</span> to <span title="(position to insert at final state)">index ' + t[1] + "</span>"
                    }, textdiff: function (t, e, n, o) {
                        var r = "undefined" == typeof o ? "" : "number" == typeof o ? " at index " + o : " at property " + wrapPropertyName(o);
                        return "text diff" + r + ', format is <a href="https://code.google.com/p/google-diff-match-patch/wiki/Unidiff">a variation of Unidiff</a>'
                    }
                }, formatAnyChange = function (t, e) {
                    var n = this.getDeltaType(e), o = deltaAnnotations[n],
                        r = o && o.apply(o, Array.prototype.slice.call(arguments, 1)), a = JSON.stringify(e, null, 2);
                    "textdiff" === n && (a = a.split("\\n").join('\\n"+\n   "')), t.indent(), t.row(a, r), t.indent(-1)
                };
                AnnotatedFormatter.prototype.format_added = formatAnyChange, AnnotatedFormatter.prototype.format_modified = formatAnyChange, AnnotatedFormatter.prototype.format_deleted = formatAnyChange, AnnotatedFormatter.prototype.format_moved = formatAnyChange, AnnotatedFormatter.prototype.format_textdiff = formatAnyChange, exports.AnnotatedFormatter = AnnotatedFormatter;
                var defaultInstance;
                exports.format = function (t, e) {
                    return defaultInstance || (defaultInstance = new AnnotatedFormatter), defaultInstance.format(t, e)
                };
            }, {"./base": 4}],
            4: [function (require, module, exports) {
                var isArray = "function" == typeof Array.isArray ? Array.isArray : function (e) {
                    return e instanceof Array
                }, getObjectKeys = "function" == typeof Object.keys ? function (e) {
                    return Object.keys(e)
                } : function (e) {
                    var t = [];
                    for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.push(r);
                    return t
                }, trimUnderscore = function (e) {
                    return "_" === e.substr(0, 1) ? e.slice(1) : e
                }, arrayKeyToSortNumber = function (e) {
                    return "_t" === e ? -1 : "_" === e.substr(0, 1) ? parseInt(e.slice(1), 10) : parseInt(e, 10) + .1
                }, arrayKeyComparer = function (e, t) {
                    return arrayKeyToSortNumber(e) - arrayKeyToSortNumber(t)
                }, BaseFormatter = function () {
                };
                BaseFormatter.prototype.format = function (e, t) {
                    var r = {};
                    return this.prepareContext(r), this.recurse(r, e, t), this.finalize(r)
                }, BaseFormatter.prototype.prepareContext = function (e) {
                    e.buffer = [], e.out = function () {
                        this.buffer.push.apply(this.buffer, arguments)
                    }
                }, BaseFormatter.prototype.typeFormattterNotFound = function (e, t) {
                    throw new Error("cannot format delta type: " + t)
                }, BaseFormatter.prototype.typeFormattterErrorFormatter = function (e, t) {
                    return t.toString()
                }, BaseFormatter.prototype.finalize = function (e) {
                    return isArray(e.buffer) ? e.buffer.join("") : void 0
                }, BaseFormatter.prototype.recurse = function (e, t, r, o, n, a, i) {
                    var f = t && a, s = f ? a.value : r;
                    if ("undefined" != typeof t || "undefined" != typeof o) {
                        var u = this.getDeltaType(t, a), p = "node" === u ? "a" === t._t ? "array" : "object" : "";
                        "undefined" != typeof o ? this.nodeBegin(e, o, n, u, p, i) : this.rootBegin(e, u, p);
                        var y;
                        try {
                            y = this["format_" + u] || this.typeFormattterNotFound(e, u), y.call(this, e, t, s, o, n, a)
                        } catch (c) {
                            this.typeFormattterErrorFormatter(e, c, t, s, o, n, a), "undefined" != typeof console && console.error && console.error(c.stack)
                        }
                        "undefined" != typeof o ? this.nodeEnd(e, o, n, u, p, i) : this.rootEnd(e, u, p)
                    }
                }, BaseFormatter.prototype.formatDeltaChildren = function (e, t, r) {
                    var o = this;
                    this.forEachDeltaKey(t, r, function (n, a, i, f) {
                        o.recurse(e, t[n], r ? r[a] : void 0, n, a, i, f)
                    })
                }, BaseFormatter.prototype.forEachDeltaKey = function (e, t, r) {
                    var o, n = getObjectKeys(e), a = "a" === e._t, i = {};
                    if ("undefined" != typeof t) for (o in t) Object.prototype.hasOwnProperty.call(t, o) && ("undefined" != typeof e[o] || a && "undefined" != typeof e["_" + o] || n.push(o));
                    for (o in e) if (Object.prototype.hasOwnProperty.call(e, o)) {
                        var f = e[o];
                        isArray(f) && 3 === f[2] && (i[f[1].toString()] = {
                            key: o,
                            value: t && t[parseInt(o.substr(1))]
                        }, this.includeMoveDestinations !== !1 && "undefined" == typeof t && "undefined" == typeof e[f[1]] && n.push(f[1].toString()))
                    }
                    a ? n.sort(arrayKeyComparer) : n.sort();
                    for (var s = 0, u = n.length; u > s; s++) {
                        var p = n[s];
                        if (!a || "_t" !== p) {
                            var y = a ? "number" == typeof p ? p : parseInt(trimUnderscore(p), 10) : p, c = s === u - 1;
                            r(p, y, i[y], c)
                        }
                    }
                }, BaseFormatter.prototype.getDeltaType = function (e, t) {
                    if ("undefined" == typeof e) return "undefined" != typeof t ? "movedestination" : "unchanged";
                    if (isArray(e)) {
                        if (1 === e.length) return "added";
                        if (2 === e.length) return "modified";
                        if (3 === e.length && 0 === e[2]) return "deleted";
                        if (3 === e.length && 2 === e[2]) return "textdiff";
                        if (3 === e.length && 3 === e[2]) return "moved"
                    } else if ("object" == typeof e) return "node";
                    return "unknown"
                }, BaseFormatter.prototype.parseTextDiff = function (e) {
                    for (var t = [], r = e.split("\n@@ "), o = 0, n = r.length; n > o; o++) {
                        var a = r[o], i = {pieces: []}, f = /^(?:@@ )?[-+]?(\d+),(\d+)/.exec(a).slice(1);
                        i.location = {line: f[0], chr: f[1]};
                        for (var s = a.split("\n").slice(1), u = 0, p = s.length; p > u; u++) {
                            var y = s[u];
                            if (y.length) {
                                var c = {type: "context"};
                                "+" === y.substr(0, 1) ? c.type = "added" : "-" === y.substr(0, 1) && (c.type = "deleted"), c.text = y.slice(1), i.pieces.push(c)
                            }
                        }
                        t.push(i)
                    }
                    return t
                }, exports.BaseFormatter = BaseFormatter;
            }, {}],
            5: [function (require, module, exports) {
                function htmlEscape(t) {
                    for (var e = t, o = [[/&/g, "&amp;"], [/</g, "&lt;"], [/>/g, "&gt;"], [/'/g, "&apos;"], [/"/g, "&quot;"]], a = 0; a < o.length; a++) e = e.replace(o[a][0], o[a][1]);
                    return e
                }

                var base = require("./base"), BaseFormatter = base.BaseFormatter, HtmlFormatter = function () {
                };
                HtmlFormatter.prototype = new BaseFormatter, HtmlFormatter.prototype.typeFormattterErrorFormatter = function (t, e) {
                    t.out('<pre class="jsondiffpatch-error">' + e + "</pre>")
                }, HtmlFormatter.prototype.formatValue = function (t, e) {
                    t.out("<pre>" + htmlEscape(JSON.stringify(e, null, 2)) + "</pre>")
                }, HtmlFormatter.prototype.formatTextDiffString = function (t, e) {
                    var o = this.parseTextDiff(e);
                    t.out('<ul class="jsondiffpatch-textdiff">');
                    for (var a = 0, r = o.length; r > a; a++) {
                        var i = o[a];
                        t.out('<li><div class="jsondiffpatch-textdiff-location"><span class="jsondiffpatch-textdiff-line-number">' + i.location.line + '</span><span class="jsondiffpatch-textdiff-char">' + i.location.chr + '</span></div><div class="jsondiffpatch-textdiff-line">');
                        for (var n = i.pieces, s = 0, d = n.length; d > s; s++) {
                            var f = n[s];
                            t.out('<span class="jsondiffpatch-textdiff-' + f.type + '">' + htmlEscape(unescape(f.text)) + "</span>")
                        }
                        t.out("</div></li>")
                    }
                    t.out("</ul>")
                };
                var adjustArrows = function (t) {
                    t = t || document;
                    var e = function (t) {
                        return t.textContent || t.innerText
                    }, o = function (t, e, o) {
                        for (var a = t.querySelectorAll(e), r = 0, i = a.length; i > r; r++) o(a[r])
                    }, a = function (t, e) {
                        for (var o = 0, a = t.children.length; a > o; o++) e(t.children[o], o)
                    };
                    o(t, ".jsondiffpatch-arrow", function (t) {
                        var o = t.parentNode, r = t.children[0], i = r.children[1];
                        r.style.display = "none";
                        var n, s = e(o.querySelector(".jsondiffpatch-moved-destination")), d = o.parentNode;
                        if (a(d, function (t) {
                                t.getAttribute("data-key") === s && (n = t)
                            }), n) try {
                            var f = n.offsetTop - o.offsetTop;
                            r.setAttribute("height", Math.abs(f) + 6), t.style.top = -8 + (f > 0 ? 0 : f) + "px";
                            var l = f > 0 ? "M30,0 Q-10," + Math.round(f / 2) + " 26," + (f - 4) : "M30," + -f + " Q-10," + Math.round(-f / 2) + " 26,4";
                            i.setAttribute("d", l), r.style.display = ""
                        } catch (c) {
                            return
                        }
                    })
                };
                HtmlFormatter.prototype.rootBegin = function (t, e, o) {
                    var a = "jsondiffpatch-" + e + (o ? " jsondiffpatch-child-node-type-" + o : "");
                    t.out('<div class="jsondiffpatch-delta ' + a + '">')
                }, HtmlFormatter.prototype.rootEnd = function (t) {
                    t.out("</div>" + (t.hasArrows ? '<script type="text/javascript">setTimeout(' + adjustArrows.toString() + ",10);</script>" : ""))
                }, HtmlFormatter.prototype.nodeBegin = function (t, e, o, a, r) {
                    var i = "jsondiffpatch-" + a + (r ? " jsondiffpatch-child-node-type-" + r : "");
                    t.out('<li class="' + i + '" data-key="' + o + '"><div class="jsondiffpatch-property-name">' + o + "</div>")
                }, HtmlFormatter.prototype.nodeEnd = function (t) {
                    t.out("</li>")
                }, HtmlFormatter.prototype.format_unchanged = function (t, e, o) {
                    "undefined" != typeof o && (t.out('<div class="jsondiffpatch-value">'), this.formatValue(t, o), t.out("</div>"))
                }, HtmlFormatter.prototype.format_movedestination = function (t, e, o) {
                    "undefined" != typeof o && (t.out('<div class="jsondiffpatch-value">'), this.formatValue(t, o), t.out("</div>"))
                }, HtmlFormatter.prototype.format_node = function (t, e, o) {
                    var a = "a" === e._t ? "array" : "object";
                    t.out('<ul class="jsondiffpatch-node jsondiffpatch-node-type-' + a + '">'), this.formatDeltaChildren(t, e, o), t.out("</ul>")
                }, HtmlFormatter.prototype.format_added = function (t, e) {
                    t.out('<div class="jsondiffpatch-value">'), this.formatValue(t, e[0]), t.out("</div>")
                }, HtmlFormatter.prototype.format_modified = function (t, e) {
                    t.out('<div class="jsondiffpatch-value jsondiffpatch-left-value">'), this.formatValue(t, e[0]), t.out('</div><div class="jsondiffpatch-value jsondiffpatch-right-value">'), this.formatValue(t, e[1]), t.out("</div>")
                }, HtmlFormatter.prototype.format_deleted = function (t, e) {
                    t.out('<div class="jsondiffpatch-value">'), this.formatValue(t, e[0]), t.out("</div>")
                }, HtmlFormatter.prototype.format_moved = function (t, e) {
                    t.out('<div class="jsondiffpatch-value">'), this.formatValue(t, e[0]), t.out('</div><div class="jsondiffpatch-moved-destination">' + e[1] + "</div>"), t.out('<div class="jsondiffpatch-arrow" style="position: relative; left: -34px;">        <svg width="30" height="60" style="position: absolute; display: none;">        <defs>            <marker id="markerArrow" markerWidth="8" markerHeight="8" refx="2" refy="4"                   orient="auto" markerUnits="userSpaceOnUse">                <path d="M1,1 L1,7 L7,4 L1,1" style="fill: #339;" />            </marker>        </defs>        <path d="M30,0 Q-10,25 26,50" style="stroke: #88f; stroke-width: 2px; fill: none;        stroke-opacity: 0.5; marker-end: url(#markerArrow);"></path>        </svg>        </div>'), t.hasArrows = !0
                }, HtmlFormatter.prototype.format_textdiff = function (t, e) {
                    t.out('<div class="jsondiffpatch-value">'), this.formatTextDiffString(t, e[0]), t.out("</div>")
                };
                var showUnchanged = function (t, e, o) {
                    var a = e || document.body, r = "jsondiffpatch-unchanged-",
                        i = {showing: r + "showing", hiding: r + "hiding", visible: r + "visible", hidden: r + "hidden"},
                        n = a.classList;
                    if (n) {
                        if (!o) return n.remove(i.showing), n.remove(i.hiding), n.remove(i.visible), n.remove(i.hidden), void(t === !1 && n.add(i.hidden));
                        t === !1 ? (n.remove(i.showing), n.add(i.visible), setTimeout(function () {
                            n.add(i.hiding)
                        }, 10)) : (n.remove(i.hiding), n.add(i.showing), n.remove(i.hidden));
                        var s = setInterval(function () {
                            adjustArrows(a)
                        }, 100);
                        setTimeout(function () {
                            n.remove(i.showing), n.remove(i.hiding), t === !1 ? (n.add(i.hidden), n.remove(i.visible)) : (n.add(i.visible), n.remove(i.hidden)), setTimeout(function () {
                                n.remove(i.visible), clearInterval(s)
                            }, o + 400)
                        }, o)
                    }
                }, hideUnchanged = function (t, e) {
                    return showUnchanged(!1, t, e)
                };
                exports.HtmlFormatter = HtmlFormatter, exports.showUnchanged = showUnchanged, exports.hideUnchanged = hideUnchanged;
                var defaultInstance;
                exports.format = function (t, e) {
                    return defaultInstance || (defaultInstance = new HtmlFormatter), defaultInstance.format(t, e)
                };
            }, {"./base": 4}],
            6: [function (require, module, exports) {
                var environment = require("../environment");
                if (exports.base = require("./base"), exports.html = require("./html"), exports.annotated = require("./annotated"), exports.jsonpatch = require("./jsonpatch"), !environment.isBrowser) {
                    var consoleModuleName = "./console";
                    exports.console = require(consoleModuleName)
                }
            }, {"../environment": 2, "./annotated": 3, "./base": 4, "./html": 5, "./jsonpatch": 7}],
            7: [function (require, module, exports) {
                !function () {
                    function t() {
                        this.includeMoveDestinations = !1
                    }

                    function e(t) {
                        return t[t.length - 1]
                    }

                    function n(t, e) {
                        return t.sort(e), t
                    }

                    function o(t) {
                        return n(t, function (t, n) {
                            var o = t.path.split("/"), r = n.path.split("/");
                            return o.length !== r.length ? o.length - r.length : d(e(o), e(r))
                        })
                    }

                    function r(t, e) {
                        var n = [], o = [];
                        return t.forEach(function (t) {
                            var r = e(t) ? n : o;
                            r.push(t)
                        }), [n, o]
                    }

                    function p(t) {
                        var e = r(t, function (t) {
                            return "remove" === t.op
                        }), n = e[0], p = e[1], u = o(n);
                        return u.concat(p)
                    }

                    var u = require("./base"), i = u.BaseFormatter, a = {
                        added: "add",
                        deleted: "remove",
                        modified: "replace",
                        moved: "moved",
                        movedestination: "movedestination",
                        unchanged: "unchanged",
                        error: "error",
                        textDiffLine: "textDiffLine"
                    };
                    t.prototype = new i, t.prototype.prepareContext = function (t) {
                        i.prototype.prepareContext.call(this, t), t.result = [], t.path = [], t.pushCurrentOp = function (t, e) {
                            var n = {op: t, path: this.currentPath()};
                            "undefined" != typeof e && (n.value = e), this.result.push(n)
                        }, t.currentPath = function () {
                            return "/" + this.path.join("/")
                        }
                    }, t.prototype.typeFormattterErrorFormatter = function (t, e) {
                        t.out("[ERROR]" + e)
                    }, t.prototype.rootBegin = function () {
                    }, t.prototype.rootEnd = function () {
                    }, t.prototype.nodeBegin = function (t, e, n) {
                        t.path.push(n)
                    }, t.prototype.nodeEnd = function (t) {
                        t.path.pop()
                    }, t.prototype.format_unchanged = function (t, e, n) {
                        "undefined" != typeof n && t.pushCurrentOp(a.unchanged, n)
                    }, t.prototype.format_movedestination = function (t, e, n) {
                        "undefined" != typeof n && t.pushCurrentOp(a.movedestination, n)
                    }, t.prototype.format_node = function (t, e, n) {
                        this.formatDeltaChildren(t, e, n)
                    }, t.prototype.format_added = function (t, e) {
                        t.pushCurrentOp(a.added, e[0])
                    }, t.prototype.format_modified = function (t, e) {
                        t.pushCurrentOp(a.modified, e[1])
                    }, t.prototype.format_deleted = function (t) {
                        t.pushCurrentOp(a.deleted)
                    }, t.prototype.format_moved = function (t, e) {
                        t.pushCurrentOp(a.moved, e[1])
                    }, t.prototype.format_textdiff = function () {
                        throw"not implimented"
                    }, t.prototype.format = function (t, e) {
                        var n = {};
                        return this.prepareContext(n), this.recurse(n, t, e), n.result
                    }, exports.JSONFormatter = t;
                    var f, d = function (t, e) {
                        var n = parseInt(t, 10), o = parseInt(e, 10);
                        return isNaN(n) || isNaN(o) ? 0 : o - n
                    }, c = function (e, n) {
                        return f || (f = new t), p(f.format(e, n))
                    };
                    exports.log = function (t, e) {
                        console.log(c(t, e))
                    }, exports.format = c
                }();
            }, {"./base": 4}]
        }, {}, [1])(1)
    })();


    if (typeof define === 'function' && define.amd) {
        define('jsdiff', [
            /*'dependency'*/
        ], function () {
            return (root.jsdiff = factory(root, jsondiffpatch, formatter));
        });
    }
    else if (typeof module === 'object' && module.exports) {
        //var dep = require('dependency')
        module.exports = (root.jsdiff = factory(root, jsondiffpatch, formatter));
    }
    else {
        root.jsdiff = factory(root, jsondiffpatch, formatter);
    }
}((typeof(window) === 'undefined'? this : window),
function factory (root, jsondiffpatch, formatter) {
    // inline formatter css for .jsondiffpatch-delta
    var formatterCss = "\
      .jsondiffpatch-delta{font-family:monospace;font-size:12px;margin:0;padding:0 0 0 12px;display:inline-block}.jsondiffpatch-delta pre{font-family:monospace;font-size:12px;margin:0;padding:0;display:inline-block}ul.jsondiffpatch-delta{list-style-type:none;padding:0 0 0 20px;margin:0}.jsondiffpatch-delta ul{list-style-type:none;padding:0 0 0 20px;margin:0}.jsondiffpatch-added .jsondiffpatch-property-name,.jsondiffpatch-added .jsondiffpatch-value pre,.jsondiffpatch-modified .jsondiffpatch-right-value pre,.jsondiffpatch-textdiff-added{background:#bfb}.jsondiffpatch-deleted .jsondiffpatch-property-name,.jsondiffpatch-deleted pre,.jsondiffpatch-modified .jsondiffpatch-left-value pre,.jsondiffpatch-textdiff-deleted{background:#fbb;text-decoration:line-through}.jsondiffpatch-unchanged,.jsondiffpatch-movedestination{color:gray}.jsondiffpatch-unchanged,.jsondiffpatch-movedestination>.jsondiffpatch-value{transition:all 0.5s;-webkit-transition:all 0.5s;overflow-y:hidden}.jsondiffpatch-unchanged-showing .jsondiffpatch-unchanged,.jsondiffpatch-unchanged-showing .jsondiffpatch-movedestination>.jsondiffpatch-value{max-height:100px}.jsondiffpatch-unchanged-hidden .jsondiffpatch-unchanged,.jsondiffpatch-unchanged-hidden .jsondiffpatch-movedestination>.jsondiffpatch-value{max-height:0}.jsondiffpatch-unchanged-hiding .jsondiffpatch-movedestination>.jsondiffpatch-value,.jsondiffpatch-unchanged-hidden .jsondiffpatch-movedestination>.jsondiffpatch-value{display:block}.jsondiffpatch-unchanged-visible .jsondiffpatch-unchanged,.jsondiffpatch-unchanged-visible .jsondiffpatch-movedestination>.jsondiffpatch-value{max-height:100px}.jsondiffpatch-unchanged-hiding .jsondiffpatch-unchanged,.jsondiffpatch-unchanged-hiding .jsondiffpatch-movedestination>.jsondiffpatch-value{max-height:0}.jsondiffpatch-unchanged-showing .jsondiffpatch-arrow,.jsondiffpatch-unchanged-hiding .jsondiffpatch-arrow{display:none}.jsondiffpatch-value{display:inline-block}.jsondiffpatch-property-name{display:inline-block;padding-right:5px;vertical-align:top}.jsondiffpatch-property-name:after{content:': '}.jsondiffpatch-child-node-type-array>.jsondiffpatch-property-name:after{content:': ['}.jsondiffpatch-child-node-type-array:after{content:'],'}div.jsondiffpatch-child-node-type-array:before{content:'['}div.jsondiffpatch-child-node-type-array:after{content:']'}.jsondiffpatch-child-node-type-object>.jsondiffpatch-property-name:after{content:': {'}.jsondiffpatch-child-node-type-object:after{content:'},'}div.jsondiffpatch-child-node-type-object:before{content:'{'}div.jsondiffpatch-child-node-type-object:after{content:'}'}.jsondiffpatch-value pre:after{content:','}li:last-child>.jsondiffpatch-value pre:after,.jsondiffpatch-modified>.jsondiffpatch-left-value pre:after{content:''}.jsondiffpatch-modified .jsondiffpatch-value{display:inline-block}.jsondiffpatch-modified .jsondiffpatch-right-value{margin-left:5px}.jsondiffpatch-moved .jsondiffpatch-value{display:none}.jsondiffpatch-moved .jsondiffpatch-moved-destination{display:inline-block;background:#ffb;color:#888}.jsondiffpatch-moved .jsondiffpatch-moved-destination:before{content:' => '}ul.jsondiffpatch-textdiff{padding:0}.jsondiffpatch-textdiff-location{color:#bbb;display:inline-block;min-width:60px}.jsondiffpatch-textdiff-line{display:inline-block}.jsondiffpatch-textdiff-line-number:after{content:','}.jsondiffpatch-error{background:red;color:white;font-weight:700}\
    ";

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    function format (/* ... */) {
        var match = null, rv = arguments[0];

        for (var c = 1, length = arguments.length; c < length; c++) {
            match = new RegExp("\\{"+ (c - 1) +"\\}", "g");
            if (match.test(rv)) {
                rv = rv.replace(match, typeof(arguments[c]) === "undefined" ? "(undefined)" : arguments[c].toString());
            }
        }

        match = null;
        return rv;
    }

    var module = {
        version: {
            jsdiff: '0.1.0',
            jsondiffpatch: jsondiffpatch.version
        },
        // popup window location
        location: {x: 200, y: 29, width: 400, height: 600}
    };

    /**
     * export internal dependencies
     * @return {{jsondiffpatch: *, formatter: *}}
     */
    module.engine = function () {
        return {jsondiffpatch: jsondiffpatch, formatter: formatter};
    };

    module.delta = function (objLeft, objRight) {
        return jsondiffpatch.diff(objLeft, objRight);
    };

    module.html = function (objLeft, objRight) {
        return formatter.html.format(
            jsondiffpatch.diff(objLeft, objRight),
            objLeft
        );
    };

    /**
     * show popup window
     */
    module.show = function (objLeft, objRight, options) {
        options = Object.assign({
            /** window title */
            title: null
        }, options);
        var delta = jsondiffpatch.diff(objLeft, objRight);
        var deltaHtml = formatter.html.format(delta, objLeft);

        // adjust new window location in diagonal order
        this.location.x += this.location.width;
        this.location.y += 29;

        // try to open popup
        var wnd = window.open('about:blank', '_blank', format(
            'width={0},height={1},left={2},top={3},' +
            'alwaysRaised=1,menubar=0,location=0,toolbar=0,status=0,scrollbars=1,resizable=1',
            this.location.width,
            this.location.height,
            this.location.x % (window.screen.width - this.location.width),
            this.location.y % (window.screen.height - this.location.height)
        ));

        // popup blocked
        if (!wnd || wnd.closed === true) {
            if (confirm('Popup window is blocked.\nContinue using current window?')) {
                wnd = window;
            }
            else {
                return null;
            }
        }

        var title = options.title;
        if (!title) {
            var thumbs = [];
            if (objLeft && typeof(objLeft) === 'object') {
                // take maximum 4 object keys to construct a distinguishable title
                var keys = Object.keys(objLeft);
                for (var n = 0, N = Math.min(4, keys.length); n < N; n++) {
                    thumbs.push(keys[n]);
                }
            }
            title = thumbs.join('|');
        }
        title += (title? ' - ' : '') + (new Date()).toLocaleTimeString();

        // popup body
        var body = [
            '<html><head>',
            '<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>',
            '<title>', title, '</title>',
            '<style type="text/css">',
                '.toolbar{position:fixed;top:0;right:0;z-index:',Date.now(),';}',
                '\n',formatterCss,
            '</style>',
            '</head><body>',
            '<aside class="toolbar">',
                '<button class="btnExit">Exit</button>',
                '<button class="btnCopy">Copy Delta<input style="position: absolute; top: -40px;"/></button>',
                '<button class="btnToggleUnmodified">Toggle Unmodified</button>',
            '</aside>',
            '<br/><hr/>',
            deltaHtml,
            '<sc', 'rip', 't type="text/javascript">',
// language=JavaScript
'\
var visible = false;\
formatter.html.showUnchanged(visible, document.body);\
window.onload=function(){window.focus();document.querySelector(".btnExit").focus();};\
document.querySelector(".btnExit").addEventListener("click", window.close.bind(window));\
document.querySelector(".btnCopy").addEventListener("click", function (e) {\
    try {\
        var input = e.target.querySelector("input");\
        input.value = JSON.stringify(window.__delta);\
        input.focus();\
        input.select();\
        document.execCommand("copy");\
    } catch (ignore) {}\
});\
document.querySelector(".btnToggleUnmodified").addEventListener("click", function () {\
    visible = !visible;\
    formatter.html.showUnchanged(visible, document.body);\
});\
'
            , '</s', 'cr', 'ipt>',
            '</body></html>'
        ].join('');

        // inject to global scope
        wnd.__delta = delta;
        wnd.formatter = formatter;

        wnd.document.write(body);
        wnd.document.close();
    };

    return module;
}));
