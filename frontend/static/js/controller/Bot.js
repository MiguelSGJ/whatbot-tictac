
async function updateBot(doc) {

    let rows = ``
    const res = await fetchData(`/bot/v1/qrcode/${doc.name}`,"GET",{} );
    rows = `
    <div class="card-body">
        <img id="qrcode" src="${res.qrcode}" />
    </div>`    

    document.getElementById("frQrcodeWhatbot").innerHTML=rows

    
}
