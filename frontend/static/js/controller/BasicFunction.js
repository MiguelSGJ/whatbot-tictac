



function change_generic_element(element,list_att) {

    if(element.value == "") {
        update_simple_invalid(list_att)    

        return 
    }

    update_simple_valid(list_att)
}


function validity_simple_element(element,list_att) {

    console.log(element.value);
    if(element.validity.valid) {
        update_simple_valid(list_att)
    } else {
        update_simple_invalid(list_att)
    }
}

function update_simple_invalid(list_att,msg="Valor não esperado.") {
    console.log("update_invalid");
    let element_id = ""

    list_att.forEach(att => {

        let ele_msg = document.getElementById(`${att}-validation`);
        let ele = document.getElementById(att)
    
        ele.className = ele.className.replaceAll(" is-invalid", "")
        ele.className = ele.className.replaceAll(" is-valid", "");

        ele.className += " is-invalid";

        ele_msg.className = "invalid-feedback";
        ele_msg.innerHTML = msg;

    })

}

function update_simple_valid(list_att) {
    console.log("update_simple_valid");

    
    list_att.forEach(att=>{ 

        let ele_msg = document.getElementById(`${att}-validation`);
        let ele = document.getElementById(att)

        ele.className = ele.className.replaceAll(" is-invalid", "")
        ele.className = ele.className.replaceAll(" is-valid", "");

        ele.className += " is-valid";

        ele_msg.className = "";
        ele_msg.innerHTML = "";
/*
        let btn = document.querySelectorAll('.submit');

        btn = btn[0];

        let repl = ` disabled-by-${att}`;

        btn.className = btn.className.replaceAll(repl, "")

        if(btn.className.indexOf("disabled-by-")==-1) {
            btn.disabled = false
        }
        */
    })

}


/**
 * VALIDATION
 * @param {*} path 
 * @param {*} element 
 * @returns 
 */

function validate_generic_element(path,element) {
    console.log("validate_generic_element");

    if(element.value == "") {
        return 
    }

    let data ={
        verify:true
    }

    data[element.id]=element.value;

    send_to_server(data, `${server}${path}`, after_validate_generic_element, "POST");

}

function after_validate_generic_element() {
    console.log("after_validate_generic_element");
    let resp = JSON.parse(this.responseText);

    console.log(resp);
    if(resp.error) {
        update_invalid(resp)
    } else {
        update_valid(resp)
    }

}

function update_valid(resp) {
    console.log("update_valid");

    let element_id = ""
    
    for(let att in resp.body) {
        element_id = att;
    }

    console.log("element_id");
    console.log(element_id);

    let ele_msg = document.getElementById(`${element_id}-validation`);


    let ele = document.getElementById(element_id)

    ele.className = ele.className.replaceAll(" is-invalid", "")
    ele.className = ele.className.replaceAll(" is-valid", "");

    ele.className += " is-valid";

    ele_msg.className = "";
    ele_msg.innerHTML = "";

    let btn = document.querySelectorAll('.submit');

    if(btn.length > 0) {
        btn = btn[0];

        let repl = ` disabled-by-${element_id}`;
    
        btn.className = btn.className.replaceAll(repl, "")
    
        if(btn.className.indexOf("disabled-by-")==-1) {
            btn.disabled = false
        }
    
    }

}

function update_invalid(resp) {
    console.log("update_invalid");
    let element_id = ""

    for(let att in resp.att) {
        element_id = att;
    }
    if(element_id!="") {

        console.log("element_id");
        console.log(element_id);

        let ele_msg = document.getElementById(`${element_id}-validation`);
        let ele = document.getElementById(element_id)
    
        ele.className = ele.className.replaceAll(" is-invalid", "")
        ele.className = ele.className.replaceAll(" is-valid", "");

        ele.className += " is-invalid";

        ele_msg.className = "invalid-feedback";
        ele_msg.innerHTML = resp.att[element_id];

//        let btn = document.querySelectorAll('.submit');

//        btn = btn[0];
    

//        let repl = ` disabled-by-${element_id}`;

//        btn.className = btn.className.replaceAll(repl, "")
        
//        btn.className+= ` disabled-by-${element_id}`;

//        btn.disabled = true


    }

}

function update_error_local() {
    console.log("update_error_local");

    let list_ele = document.querySelectorAll('.needs-validation');

    let update = false
    list_ele.forEach(ele => {

        let resp = {
            att:{},
            body:{}
        }
    
        resp.body[ele.id] = ele.value;
        resp.att[ele.id] = "Valor não esperado."
        let disabled = ele.disabled;

        ele.disabled = false;

        if(ele.validity.valid) {
            ele.disabled=disabled;
            update_valid(resp)
        } else {
            ele.disabled=disabled;
            update = true;
            update_invalid(resp)
        }
    })

    return update;

}

function update_error_local_i(i) {
    console.log("update_error_local_i");

    let list_ele = document.querySelectorAll('.needs-validation');

    let list_ele_i = []

    list_ele.forEach(ele => {
        if(ele.id.indexOf(`_${i}`) > -1) {
            list_ele_i.push(ele)
        }
    })

    let update = false
    list_ele_i.forEach(ele => {

        let resp = {
            att:{},
            body:{}
        }
    
        resp.body[ele.id] = ele.value;
        resp.att[ele.id] = "Valor não esperado."
        let disabled = ele.disabled;

        ele.disabled = false;

        if(ele.validity.valid) {
            ele.disabled=disabled;
            update_valid(resp)
        } else {
            ele.disabled=disabled;
            update = true;
            update_invalid(resp)
        }
    })

    return update;

}

/**
     * SECTOR
     */

function list_sector() {
    console.log("list_sector");

    const data = {}
    send_to_server(data, `${server}/taxes/sector`, resp_list_sector, "GET")

}


function resp_list_sector() {
    console.log("resp_list_sector");

    let resp = JSON.parse(this.responseText);
    
    let sector_key = get_property_from_storage("property","property.address.sector_key")

    let row = `<option value=""></option>`
    resp.forEach(function (op) {
        let selected = "";
        if(sector_key == op._key) {
            selected = "selected"
        }
        row += `<option ${selected} value="${op._key}">${op._key}</option>`
        
    })
    let element = document.getElementById("sector_key")

    if(element!=null) { 
        element.innerHTML = row;
    }
    if(sector_key != "") {
        list_block(sector_key)

    }

}

function list_block(sector_key) {

    const data = {
        sector_key:sector_key
    }
    send_to_server(data, `${server}/block/searchFullBlock`, resp_list_block, "PUT")

}

function resp_list_block() {

    console.log("resp_list_block");

    let resp = JSON.parse(this.responseText);

    let block_key = get_property_from_storage("property","property.address.block_key")

    let selected_block = null;
    let row = `<option value=""></option>`
    resp.forEach(function (op) {
        let selected = "";
        if(block_key == op._key) {
            selected_block = op;
            selected = "selected"
        }
        row += `<option ${selected} value="${op._key}">${op.number}</option>`
        
    })
    let element_block = document.getElementById("block_key")

    if(element_block!=null) { 
        element_block.innerHTML = row;
    }
    list_way(selected_block);
    list_property(selected_block);

}

function list_way(block) {


    if(block == null) {

        return
    }

    let perimeter = block.perimeter;

    let way_key = get_property_from_storage("property", "property.address.public_way_key")
    
    let row = `<option value=""></option>`

    perimeter.forEach(function (op) {
        let selected = "";
        if (way_key == op._key) {
            selected = "selected"
        }
        row += `<option ${selected} value="${op._key}">${op.abbreviation} ${op.name}</option>`
    })
    let element_way = document.getElementById("public_way_key")
    
    if(element_way != null) {

        element_way.innerHTML = row

    }

}

function list_property(block) {


    if(block == null) {

        return
    }

    let list_property = block.list_property;

    let property_key = get_property_from_storage("property", "property.address.property_key")
    
    let row = `<option value=""></option>`

    list_property.forEach(function (op) {
        let selected = "";
        if (property_key == op._key) {
            selected = "selected"
        }
        row += `<option ${selected} value="${op._key}">${op.address.plot_number}</option>`
    })
    let element = document.getElementById("list_property")
    
    if(element != null) {

        element.innerHTML = row

    }

}

/**
 * 
 * @param {*} property_base 
 * @param {*} property_path 
 * @param {*} value 
 * @returns 
 */
function checked(property_base,property_path,value) {

    let r = get_property_from_storage(property_base,property_path);

    let result = "";

    if(r == value) {

        result = "checked"
    }

    return result;

}

function send_to_server(obj, url, call, method = "PUT") {

    console.log("URL URL");
    console.log(url);


    let obj_str = JSON.stringify(obj)

    var oReq = new XMLHttpRequest();

    oReq.addEventListener("load", call);
    oReq.open(method, url);
    oReq.setRequestHeader("Content-Type", "application/json");
    oReq.withCredentials = true; // Permite enviar cookies de autenticação

    // Obtém o token de acesso armazenado no cookie
    const token = get_property_from_storage("user","token");

    // Define o cabeçalho de autenticação com o token
    oReq.setRequestHeader("Authorization", `Bearer ${token} ${get_property_from_storage("user","name")}`);


    oReq.send(obj_str);

}

function send_to_server_sinc(obj, url, call, method = "PUT") {

    let obj_str = JSON.stringify(obj)

    var oReq = new XMLHttpRequest();

    oReq.addEventListener("load", call);
    oReq.open(method, url);
    oReq.setRequestHeader("Content-Type", "application/json");
    oReq.withCredentials = true; // Permite enviar cookies de autenticação

    // Obtém o token de acesso armazenado no cookie
    const token = get_property_from_storage("user","token");

    // Define o cabeçalho de autenticação com o token
    oReq.setRequestHeader("Authorization", `Bearer ${token} ${get_property_from_storage("user","name")}`);


    oReq.send(obj_str);

}

function send_to_server_with_token(obj, url, call, method = "PUT") {

    let obj_str = JSON.stringify(obj)

    var oReq = new XMLHttpRequest();

    oReq.addEventListener("load", call);
    oReq.open(method, url);
    oReq.setRequestHeader("Content-Type", "application/json");
    oReq.withCredentials = true; // Permite enviar cookies de autenticação

    // Obtém o token de acesso armazenado no cookie
    const token = get_property_from_storage("user","token");

    // Define o cabeçalho de autenticação com o token
    oReq.setRequestHeader("Authorization", `Bearer ${token} ${get_property_from_storage("user","name")}`);
    

    oReq.send(obj_str);

}
function set_property_to_storage(obj_name,data) {

    window.sessionStorage.setItem(obj_name, JSON.stringify(data))

}


function get_property_from_storage(obj_name,att_name) {

    let obj = window.sessionStorage.getItem(obj_name);

    if(obj == null) {
        return ""
    }

    let obj_parse = JSON.parse(obj)

    if(att_name==undefined) {
        return obj_parse;
    }


    let split_att = att_name.split(".");

    att_name = split_att[0];

    obj_parse = obj_parse[att_name];

    
    for(let i =1; i<split_att.length && obj_parse!= undefined; i++) {

        att_name = split_att[i];

        obj_parse = obj_parse[att_name];

    }    

    if(obj_parse == undefined) {

        return "";
    }
    
    return obj_parse;
}

function remove_from_buffer(key) {
    window.sessionStorage.removeItem(key)
}

function disable() {
    //console.log("disabled");

    let action = get_property_from_storage("action","value")

    if(action == undefined || action =="" || action == "aof-view"){
        return "disabled";
    }

    return "";

}

function disabled_oposite() {
    //console.log("disabled");

    let action = get_property_from_storage("action","value")

    if(action == "aof-edit" || action == "aof-new"){
        return "disabled";
    }

    return "";

}


function turn_form_for_update_mode(path,key) {

    console.log("turn_form_for_update_mode");

    
    window.open(`${client}${path}/${key}`,"_self")

}

function new_form(path) {

    window.open(`${client}${path}`,"_self")
}

function open_to_edit(path) {
    console.log("open_to_edit");

    window.open(`${client}${path}`,"_self")

}


