import { v2 as cloudinary} from "cloudinary";
import fs from "fs"

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET
    });
    
    const uploadOnCloudinary = async (localFilePath) => {
        try{
            if(!localFilePath){
                return null ;
            }
            const res = await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
            })
            console.log("File Uploaded On Cloudinary . . .",res.url)
            fs.unlink(localFilePath, (err) => {
                if (err) {
                  console.error("Failed to delete local file:", err);
                } else {
                  console.log("Local file deleted successfully.");
                }
              });
            
            return res.url;
        }catch(err){
            //It will remove the file from the server when upload is failed . . .
            fs.unlinkSync(localFilePath)
            return null ;
        }
    }

export {uploadOnCloudinary}