import {mkdir,cp,rm} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','style.css','js','libs'])await cp(file,`dist/${file}`,{recursive:true});
console.log('Static build ready in dist/');
