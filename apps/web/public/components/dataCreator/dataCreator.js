if(dataCreator={})
{
}
else{
   var dataCreator={};
}
// put percent for mob tab desk
dataCreator.clampBuilder = function (min, prefer, max) {
    let minWidthPx = 576;
    let maxWidthPx = 1200;
    let mx = maxWidthPx / 100 * max;
    let mn = minWidthPx / 100 * min;
    return `clamp(${parseInt(mn)}px,  ${prefer}vw , ${parseInt(mx)}px)`;
}

dataCreator.getColor= function (type) {
    switch (type) {
        case 'primary':
            return('rgb(0, 118, 163)')
        default:
            break;
    }
}

try {
    module.exports = dataCreator;
} catch (error) {
    
}


  