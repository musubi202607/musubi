// =========================
// Cloudinary 共通
// =========================


// =========================
// 画像縮小
// =========================
async function resizeImage(file){

  return new Promise((resolve)=>{

    const img =
      new Image();

    const reader =
      new FileReader();

    reader.onload = e=>{

      img.onload = ()=>{

        const MAX = 1200;

        let width =
          img.width;

        let height =
          img.height;

        if(width > height){

          if(width > MAX){

            height =
              height * MAX / width;

            width = MAX;

          }

        }else{

          if(height > MAX){

            width =
              width * MAX / height;

            height = MAX;

          }

        }

        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width =
          width;

        canvas.height =
          height;

        const ctx =
          canvas.getContext(
            "2d"
          );

        ctx.drawImage(

          img,

          0,

          0,

          width,

          height

        );

        canvas.toBlob(

          blob=>{

            resolve(

              new File(

                [blob],

                file.name,

                {

                  type:
                    "image/jpeg"

                }

              )

            );

          },

          "image/jpeg",

          0.85

        );

      };

      img.src =
        e.target.result;

    };

    reader.readAsDataURL(file);

  });

}

// =========================
// Cloudinary 共通
// =========================


// =========================
// 画像縮小
// =========================
async function resizeImage(file){

  return new Promise((resolve)=>{

    const img =
      new Image();

    const reader =
      new FileReader();

    reader.onload = e=>{

      img.onload = ()=>{

        const MAX = 1200;

        let width =
          img.width;

        let height =
          img.height;

        if(width > height){

          if(width > MAX){

            height =
              height * MAX / width;

            width = MAX;

          }

        }else{

          if(height > MAX){

            width =
              width * MAX / height;

            height = MAX;

          }

        }

        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width =
          width;

        canvas.height =
          height;

        const ctx =
          canvas.getContext(
            "2d"
          );

        ctx.drawImage(

          img,

          0,

          0,

          width,

          height

        );

        canvas.toBlob(

          blob=>{

            resolve(

              new File(

                [blob],

                file.name,

                {

                  type:
                    "image/jpeg"

                }

              )

            );

          },

          "image/jpeg",

          0.85

        );

      };

      img.src =
        e.target.result;

    };

    reader.readAsDataURL(file);

  });

}