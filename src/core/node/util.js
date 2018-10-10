import flag from "../flag"

function changeColor(ctx, imgEle, tarR, tarG, tarB, oriR, oriG, oriB) {
  const cW = flag.canvas.width = imgEle.width
  const cH = flag.canvas.height = imgEle.height

  ctx.clearRect(0, 0, cW, cH)
  ctx.drawImage(imgEle, 0, 0)

  const imgData = ctx.getImageData(0, 0, cW, cH)
  const imgInnerData = imgData.data

  for (let i = 0; i < cW; i++) {
    for (let j = 0; j < cH; j++) {
      const n = 4 * (i + j * cW)

      if (
        (oriR || oriG || oriB)
        && (
          imgInnerData[n] === oriR
          && imgInnerData[n + 1] === oriG
          && imgInnerData[n + 2] === oriB
        )
      ) {
        imgInnerData[n] = tarR
        imgInnerData[n + 1] = tarG
        imgInnerData[n + 2] = tarB
      }
    }

    ctx.putImageData(imgData, 0, 0, 0, 0, imgEle.width, imgEle.height)
  }

  const url = flag.canvas.toDataURL()

  if (
    oriR !== undefined
    || oriG !== undefined
    || oriB !== undefined
  ) {
    flag.alarmImageCache[imgEle.src + 'tag' + tarR + tarG + tarB] = url
  }

  return url
}
export function getImageAlarm(imgEle, b) {
  !b && (b = 255)

  try {
    if (alarmImageCache[imgEle.src]) return alarmImageCache[imgEle.src]
    
    const image = new Image
      
    image.src = changeColor(flag.graphics, imgEle, b)

    alarmImageCache[imgEle.src] = image
    
    return image
  } 
  catch (e) {
  }

  return null
}
