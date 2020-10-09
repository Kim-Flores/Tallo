const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
let items = document.getElementById('items');

searchBtn.addEventListener('click',(event) =>{
    event.preventDefault()
    let keyword = searchInput.value
    fetch('/searchResult', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          keyword
        })
      })
      .then(response => {
        if (response.ok) return response.json()
      })
      .then(data => {
        let element = items;
        while (items.firstChild) {
        element.removeChild(items.firstChild);
}
        data.results.forEach((element,index) => {
          let name = element.record.name
          let commonName = element.record.preferred_common_name
          let animalImg, animalImg2;
          let wiki = element.record.wikipedia_url
          let div = document.createElement('div')
          let nameText = document.createTextNode(name)
          let commonNameTxt = document.createTextNode(commonName)
          div.appendChild(nameText)
          div.appendChild(commonNameTxt)
          let wikiLink = document.createElement('a')
          wikiLink.href = wiki
          wikiLink.innerHTML = wiki
          div.appendChild(wikiLink)
          if(!element.record.taxon_photos){
            animalImg = "Image not available"
            animalImg2 = "Image not available"
          }else{
           animalImg = element.record.taxon_photos.forEach((img, index) => {
             if(index == 0){
               animalImg = img.photo.medium_url
               let img1 = document.createElement('img')
               img1.src = animalImg
               div.appendChild(img1)
             }else if (index == 1){
               animalImg2 = img.photo.medium_url
               let img2 = document.createElement('img')
                img2.src = animalImg2
                div.appendChild(img2)
             }
           })
          }
          
          items.appendChild(div)
          console.log(items)
        });
        // window.location.reload(true)
      })
    });



           
    