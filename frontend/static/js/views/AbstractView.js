export default class {
    constructor(params) {
        this.params = params;
        this.user
    }

    setTitle(title) {
        document.title = title;
    }

    async getHtml() {
        return "";
    }


    async init() {

    }
    async getMenu() {

//        let user = get_property_from_storage("user");

        let row = ``

            row += `
            <nav class="navbar navbar-expand-lg navbar-light bg-light">
                
                <div class="container-fluid">
                    <a class="navbar-brand" href="/dashboard"></a>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarSupportedContent">
                  <ul class="navbar-nav me-auto mb-2 mb-lg-0">
    
              `
                row += `
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
                        aria-expanded="false">
                        Contratos
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <li><a class="dropdown-item nav__link" href="/contract" aof-new data-link>Novo Contrato</a></li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li><a class="dropdown-item nav__link" href="/contractSearch" data-link>Localizar Contrato</a></li>
                        </ul>
                    </li>`
                row += `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    Objetivos
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <li><a class="dropdown-item nav__link" href="/user" aof-new data-link></a></li>
                    </ul>
                </li>`
            row += `      
                </ul>
              </div>
            </div>
          </nav>`
    
    
        return row
      
    
    }

    async remove_from_buffer(key) {


        window.sessionStorage.removeItem(key)
    }

    async preGetHtml() {

        return ""
    }
}