import { Data } from './data.mjs';
import {} from '@environment-safe/json-schema';
import { File, Path } from '@environment-safe/file';
export class JsonSchemaData extends Data{
    constructor(options = { directories: ['./data/']}){
        super();
        this.loaded = this.preload(options);
    }
    
    //TODO: type detection for mixed types
    
    async loadFile(filename){
        const file = new File(filename);
        const thisPath = new Path(filename);
        const nativeMeta = thisPath.parsed.posix || thisPath.parsed.windows;
        const fileName = nativeMeta.name.split('.').shift();
        file.name = fileName;
        await file.loaded;
        return file;
    }
    
    async preload(options){
        if(options.directories){
            const dirs = options.directories;
            let theseFiles;
            let allFiles = [];
            for(let lcv=0; lcv< dirs.length; lcv++){
                theseFiles = await this.scanDirectory(dirs[lcv]);
                allFiles = allFiles.concat(theseFiles.map((file)=>{
                    return Path.join(dirs[lcv], file);
                }));
            }
            const fileBodies = [];
            let fileLoadFutures = [];
            let thisPath;
            let nativeMeta;
            let fileName;
            for(let lcv=0; lcv< allFiles.length; lcv++){
                fileBodies[lcv] = new File(allFiles[lcv]);
                fileLoadFutures.push(fileBodies[lcv].load());
                thisPath = new Path(allFiles[lcv]);
                nativeMeta = thisPath.parsed.posix || thisPath.parsed.windows;
                fileName = nativeMeta.name.split('.').shift();
                fileBodies[lcv].name = fileName;
            }
            await Promise.all(fileLoadFutures);
            this.fileNames = allFiles;
            this.files = fileBodies;
            return;
        }
        if(options.files){
            const allFiles = options.files;
            const fileBodies = [];
            let fileLoadFutures = [];
            let thisPath;
            let nativeMeta;
            let fileName;
            for(let lcv=0; lcv< allFiles.length; lcv++){
                fileBodies[lcv] = new File(allFiles[lcv]);
                fileLoadFutures.push(fileBodies[lcv].load());
                thisPath = new Path(allFiles[lcv]);
                nativeMeta = thisPath.parsed.posix || thisPath.parsed.windows;
                fileName = nativeMeta.name.split('.').shift();
                fileBodies[lcv].name = fileName;
            }
            await Promise.all(fileLoadFutures);
            this.fileNames = allFiles;
            this.files = fileBodies;
        }
    }
    
    async scanDirectory(path, filter){
        const list = await File.list(path, {
            files: true,
            directories: false
        });
        return list;
    }
    
    toJsonSchema(file){
        const str = file.body().cast('string');
        const data = JSON.parse(str);
        data.name = file.name;
        return data;
    }
}