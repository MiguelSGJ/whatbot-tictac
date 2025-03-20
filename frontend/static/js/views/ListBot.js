import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Lista de Bots");
    }

    async getHtml() {
        
        let row = `
        
            <div class="card">
                <div class="card-header">
                </div>                
                <div class="card-body">`
                this.list.forEach(element => {
        row += `
                    <div class="card">
                        <div class="card-head">
                            <a id="${element._key}" class="btn btn-outline-primary form-control" href="/bot/${element.name}">${element.name}</a>
                        </div>
                    </div>`
                        
                })
                row += `
                </div>
            </div>`
            //<img onload="showStatus('/status/contract')" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" >`

        return row;

    }

    async getMenu() {

        let row = `
            <ul class="nav nav-tabs justify-content-center">

                <li class="nav-item">
                    <a class="nav-link" href="/dashborad">WhatBot</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link  active" href="#">Bots</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/bot/new">Novo Bot</a>
                </li>
            </ul>
            `
        return row; 
    }

    async init() {
        console.log("int");

        this.list = await fetchData(`/bot/v1`, "GET")

    }


}