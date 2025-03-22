var dataCreator;
// 
// if(module.exports)
try {
    dataCreator =  require('../dataCreator/dataCreator');
} catch (error) {
    
}
let lgSize = 992;

function mediaCreator(className,main,lg='') {
    
    let media=  /*html*/ `
        <style>
            .${className}{
                ${main}
            }
           
        </style>
    `;
    return media;
}
ejsDesign={}
ejsDesign.gameTypeIcon = (strTime,sizePercent) => {
    let fileName='';
    switch (strTime) {
        case 'bullet':
            fileName = 'clock-red icon.png';
            break;
        case 'blitz':
            fileName = 'clock-orange icon.png';
        break;
        case 'rapid':
            fileName = 'clock-green icon.png';
        break;
        case 'classic':
            fileName = 'clock-blue icon.png';
        break;
        default:
            break;
    }
    return (`<img  src='/public/img/${fileName}' style='width:${sizePercent}%' />`)
}

ejsDesign.pageHeaderTitle=function (title) {
    let media = mediaCreator('pageHeaderTitleStyle', /*html*/
    `
        font-size: clamp(1.2rem, 6.5vw, 2.3rem);
        color: rgb(53, 51, 51);
    `);
    return  /*html*/ `
    ${media}
    <span class='pageHeaderTitleStyle pt-2'>
        ${title}
    </span>
    `;
}

ejsDesign.btnLink=function (title,type,link=null) {
    let color= dataCreator.getColor(type);
    let media = mediaCreator('btnLinkStyle',
    `
        font-size: clamp(0.9rem, 1.1vw, 1.6rem);
        border-width: 8.333px;
        border-color: ${color};
        border-style: solid;
        border-radius: 8px;
        background-color: ${color};
        box-shadow: 0px 3px 4px 0.8px rgba(35, 31, 32, 0.75);
        padding: clamp(3px, 4px, 5px) 15px 5px 15px;
    `)
    return `${media}
    <a href='${link}' class='btn btn-${type} btnLinkStyle' >
        ${title}
    </a>
    `;
}
ejsDesign.partHeader=function (title,link=null) {
    let media = mediaCreator('partHeaderStyle',
    `
        padding: clamp(0.1rem, 0.01vw, 0.7rem)  clamp(0.2rem, 1.5vw, 1.3rem) 0 ;
        font-size: clamp(0.5rem, 3.1vw, 1.2rem);
        border-width: clamp(0.2rem, 0.3vw, 0.7rem);
        border-color: rgb(190, 188, 177);
        border-style: solid;
        background-color: rgb(217, 215, 201);
        box-shadow: 0px 4px 3px 0px rgba(0, 0, 0, 0.85);
    `,)
    return `${media}
        <div  class='d-flex  justify-content-between partHeaderStyle' >
            <span>
                ${title}
            </span>
            <a href='${link}' style="font-size: clamp(0.2rem, 1vw, 0.9rem);padding-top:clamp(0.2rem, 0.4vw, 0.4rem) ;">
            ${link ? 'See More >>':''}
            
            </a>
            
        </div>
    `;
}

try {
    module.exports = ejsDesign;
} catch (error) {
    
}

  