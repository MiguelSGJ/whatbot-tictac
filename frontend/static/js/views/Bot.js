import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    result = "No Result"

    constructor(params) {
        super(params);
        this.setTitle("Bot");

        this.doc = {
            _key:"",
            name:"",
            qrcode: ""
        };

    }

    async getMenu() {

        let row = `
                <ul class="nav nav-tabs justify-content-center">
                    <li class="nav-item">
                        <a class="nav-link" href="/">WhatBot</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="#">Bot</a>
                    </li>
            </ul>
            `
        return row;
    }

    async init() {

        const _key = this.params._key;
        if(!!_key) {

            this.doc = await fetchData(`/bot/v1/qrcode/${_key}`,"GET")
            console.log("o Key:", _key)
            console.log("o name:", this.doc.name)
        } 
                                    
    }
    
    async getHtml() {

        let row = ``

        row += `
        <input type="hidden" class="aof-input" id="_key" value="${this.doc._key}">
        <div class="card">            
            <div class="card-head"> 
                <div class="form-floating">
                    <input class="form-control aof-input" type="text" value="${this.doc.name}"
                    autocomplete="off" id="name" placeholder="name" required>
                    <label for="name">Nome:</label>
                </div>
            </div>
            <div class="card-body">
                <div id="frQrcodeWhatbot"></div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary" onclick="save('/bot/v1','/bot/list')">Salve</button>
            </div>
        </div>
        
        `
        row += `<img onload='updateBot(${JSON.stringify(this.doc)})' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' >`

        return row;
    }
    
}