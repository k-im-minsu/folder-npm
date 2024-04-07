const fs=require('fs')
const err=[]
const check=[]
function CheckModuel(path){
    path=path.replace(/\\/gi,"/")
    const p=path+'/.fnpm'
    const pp=path+'/package.json'
    if(fs.existsSync(p)&&fs.existsSync(pp)){
        const fnpm=JSON.parse(fs.readFileSync(p))
        const pkg=JSON.parse(fs.readFileSync(pp))
        const filter=[]
        for(var fn of fnpm.ignore){
            fn=fn.replace(/\\/gi,"/")
            if(fn.length>2&fn[0]==='*'&&fn[1]==='.'){
                filter.push({i:3,s:fn.substr(2,fn.length-2)})
            }else if(fn.length>1){
                if(fn[fn.length-1]==='/'){
                    if(fn[0]==='/'){
                        const ff=fn.substr(1,fn.length-1)
                        filter.push({i:21,s:ff.substr(0,ff.length-1).split('/')})
                    }else{
                        filter.push({i:2,s:fn.substr(0,fn.length-1).split('/')})
                    }
                }else if(fn[0]==='/'){
                    filter.push({i:1,s:fn.substr(1,fn.length-1).split('/')})
                }else{
                    filter.push({i:0,s:fn.split('/')})
                }
            }else if(fn.length>0){
                filter.push({i:0,s:fn.split('/')})
            }
        }
        return {path:path,filter:filter,pkgname:pkg.name,dependencies:pkg.dependencies,ver:pkg.version,need:fnpm.dependencies}
    }else{
        return null
    }
}
function CheckName(filename,filter,is_folder){
    switch(filter.i){
        case 1:
            filename=filename.split('/')
            if(filename.length>=filter.s.length){
                for(var i in filter.s){
                    if(filter.s[i]!==filename[i]){
                        return true
                    }
                }
                return false
            }
            break
         case 21:
              filename=filename.split('/')
              if(filename.length>=filter.s.length){
                  for(var i in filter.s){
                     if(filter.s[i]!==filename[i]){
                        return true
                       }
                  }
                  if(filename.length==filter.s.length&&!is_folder)return true
                  return false
              }
             break
        case 2:
            filename=filename.split('/')
            if(filename.length>=filter.s.length){
                var ti=0
                for(var i in filename){
                    if(filter.s[ti]===filename[i]){
                        ti++
                        if(ti==filter.s.length){
                            if(filename.length-1==i&&!is_folder)return true
                            return false
                        }
                    }else{
                        ti=0
                    }
                }
            }
            break
        case 3:
            if(!is_folder){
                filename=filename.split('/')
                const i=filename[filename.length-1].indexOf('.')
                if(filename.substr(i+1,filename.length-(i+1))===filter.s){
                    return false
                }
            }
            break
        default:
            filename=filename.split('/')
            if(filename.length>=filter.s.length){
                var ti=0
                for(var i in filename){
                    if(filter.s[ti]===filename[i]){
                        ti++
                        if(ti==filter.s.length){
                            return false
                        }
                    }else{
                        ti=0
                    }
                }
            }
            break
    }
    return true
}
function CopyTo(c,cpath){
    const nmpath=cpath+'node_modules'
    if(!fs.existsSync(nmpath)){
        fs.mkdir(nmpath)
    }
    nmpath+='/'+c.pkgname
    if(fs.existsSync(nmpath)){
        fs.rmSync(nmpath,{ recursive: true, force: true })
    }
    fs.mkdir(nmpath)
   const list= fs.readdirSync(c.path)
   for(var name of list){
    const stat=fs.statSync(c.path+'/'+name)
    if( stat.isFile()){
        if(CheckName(name,c.filter,false)){
            fs.cpSync(c.path+'/'+name,nmpath+'/'+name)
        }
    }else{
        if(CheckName(name,c.filter,true)){
            fs.mkdir(nmpath+'/'+name)
            ChildCopyTo(1,c.path+'/'+name,nmpath+'/'+name,c,naem+'/')
        }
    }
   }
}
function ChildCopyTo(index,path,cpath,c,stack){
    const list= fs.readdirSync(path)
    for(var name of list){
     const stat=fs.statSync(path+'/'+name)
     if( stat.isFile()){
         if(CheckName(stack+name,c.filter,false)){
             fs.cpSync(path+'/'+name,cpath+'/'+name)
         }
     }else{
         if(CheckName(stack+name,c.filter,true)){
             fs.mkdir(cpath+'/'+name)
             ChildCopyTo(index+1,path+'/'+name,cpath+'/'+name,c,stack+name+'/')
         }
     }
    }
}
function CheckVer(base,change){
    base=base.split('.')
    change=change.split('.')
    for(var i in base){
        const b=Number(base[i])
        const c=Number(change[i])
        if(b<c){
            return 1
        }else if(b>c){
            return -1
        }
    }
    return 0
}
const FromParentPath=(foldername)=>{
    Path('../'+foldername)
}
const Path=(path)=>{
    const r=CheckModuel(path)
    if(r){
        check.push(r)
    }else{
        err.push('Error : not folder-npm module "'+path+'"')
    }
}
const Install=()=>{
    var cpath=__dirname+'/'
    while(!fs.existsSync(cpath+'package.json')){
        cpath+='../'
    }
    if(err.length>0){
        for(var e of err){
            console.log(e)
        }
        return
    }
    const npkg_list={}
    const pkg_list={}
    for(var c of check){
        npkg_list[c.pkg]=c.ver
    }
    for(var c of check){
       for(var need in c.need){
        const ver=c.need[need]
        const ever=npkg_list[need]
        if(!ever){
            err.push('Error : not contain dependency of folder-npm module ("'+c.pkg+'" need "'+need+'" )')
            continue
        }
        if(CheckVer(ever,ver)>0){
            err.push('Error : "'+need+'" the required version of "'+ver+'" is higher than that of "'+ever+'"')
            continue
        }
       }
       for(var need in c.dependencies){
        const ver=c.dependencies[need]
        const pl=pkg_list[need]
        if(!pl){
            pkg_list[need]=ver
        }else if(CheckVer(pl,ver)>0){
            pkg_list[need]=ver
        }
       }
    }
    if(err.length>0){
        for(var e of err){
            console.log(e)
        }
        return
    }
    for(var c of check){
        CopyTo(c,cpath)
    }
    const pkg=JSON.parse(fs.readFileSync(cpath+'package.json'))
    for(var need in pkg.dependencies){
        const ver=pkg.dependencies[need]
        const ever=pkg_list[need]
        if(!ever){
            pkg_list[need]=ver
        }else if(CheckVer(ver,ever)>0){
            pkg_list[need]=ver
        }
    }
    pkg.dependencies=pkg_list
    fs.writeFileSync(cpath+'package.json',JSON.stringify(pkg,null,2))
    if(!fs.existsSync(cpath+'.fnpm')){
        fs.writeFileSync(cpath+'.fnpm',JSON.stringify({
            ignore:['.git','*.log','node_modules/'],
            dependencies:npkg_list
        },null,2))
    }else{
        const npkg=JSON.parse(fs.readFileSync(cpath+'.fnpm'))
        npkg.dependencies=npkg_list
        fs.writeFileSync(cpath+'.fnpm',JSON.stringify(npkg,null,2))
    }
    process.chdir(cpath)
    var child_process = require('child_process');
    child_process.execSync('npm install');
}