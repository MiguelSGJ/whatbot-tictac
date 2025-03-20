import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Whatbot");
        
    }

    async init() {
    }

    async getHtml() {
        
        let row = `
        
            <div class="card" style="border-top: none;">
                <div class="card-header">
                </div>                
                <div class="card-body">
                
                </div>
            </div>`
            //<img onload="showStatus('/status/contract')" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" >`

        return row;

    }

    async getMenu() {

        let row = `
            <ul class="nav nav-tabs justify-content-center">
                <li class="nav-item">
                    <a class="nav-link active" href="/">WhatBot</a>
                </li>
                <li class="nav-item">
                        <a class="nav-link" href="/bot/list">Bots</a>
                </li>
            </ul>
            `
        return row; 
    }




}