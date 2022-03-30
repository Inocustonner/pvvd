// add multiple secrets and naming to them
// add custom cut to each secret key
import fs from 'fs';

import copy from 'copy-to-clipboard'
import template from 'es6-dynamic-template'
import { iter_secrets, create_secret, set_secret, remove_secret, hash, set_cut, get_cut } from './secrets_manager'

import './styles.css'
import './icon128.png'

// parcel statically analyzes this and automatically read the file
const secret_template = fs.readFileSync(__dirname + '/templates/secret.html', 'utf8');

const CHECKED_ID_STORE = "_last_checked"

// const SECRET_INP_EL = document.getElementById("secret")
const SALT_INP_EL = document.getElementById("salt")
const OPTIONS_CONT = document.getElementById("options_container")
const PURPOSE_GEN_NAME = document.getElementById("purpose_gen_name")

var CURR_PURPOSE = ""
const trigger_hasing = () => SALT_INP_EL.dispatchEvent(new Event("input"))

const remove_secret_el = (purpose) => {
    const node = OPTIONS_CONT.querySelector(`#secret_radio_${purpose}`).parentElement
    node.remove()
    
    remove_secret(purpose)
}

const check_purpose = (purpose_div) => {
    purpose_div.querySelector("[name='secret_radio']").checked=true
    purpose_div.querySelector("[name='secret_radio']").dispatchEvent(new Event("change"))
}

var LAST_CHECKED = null
const add_secret_el = (purpose, secret) => {
    const node_template = document.createElement("template")
    node_template.innerHTML = template(secret_template, {purpose: purpose, secret: secret, cut: get_cut(purpose)})
    OPTIONS_CONT.append(node_template.content)

    let node = OPTIONS_CONT.lastElementChild
    let node_id = OPTIONS_CONT.childElementCount - 1
    node.querySelector("[name='secret_radio']").addEventListener("change", _ => {
        // called only when checked
        CURR_PURPOSE = purpose
        trigger_hasing()

        if (LAST_CHECKED !== null) {
            LAST_CHECKED.querySelector("details").open = false // close details
        }
        LAST_CHECKED = node
        localStorage.setItem(CHECKED_ID_STORE, node_id.toString())
    })
    node.querySelector("[name='secret_radio']").addEventListener("dblclick", _ => {
        const details = node.querySelector("details")
        details.open = !details.open
    })
    node.querySelector("[name='close']").addEventListener("click", _ => remove_secret_el(purpose))
    node.querySelector("[name='secret']").addEventListener("input", e => set_secret(purpose, e.target.value))
    node.querySelector("[name='cut']").addEventListener("input", e => {
        const val = e.target.value
        if (val !== "")
            set_cut(purpose, parseInt(e.target.value))
        trigger_hasing()  
    })

    // if (OPTIONS_CONT.childElementCount == 1) {
    //     node.querySelector("[name='secret_radio']").checked=true
    //     node.querySelector("[name='secret_radio']").dispatchEvent(new Event("change"))
    // }
}

document.getElementById("purpose_gen_name").addEventListener("keyup", e => {
    if (e.key == "Enter") {
        let purpose = PURPOSE_GEN_NAME.value
        PURPOSE_GEN_NAME.value = ""
        add_secret_el(purpose, create_secret(purpose))
        document.getElementById("gen_details").open = false
        check_purpose(OPTIONS_CONT.lastElementChild)
    }
})

SALT_INP_EL.addEventListener("input", e => {
    const salt = e.target.value
    if (salt !== "")
        copy(hash(CURR_PURPOSE, salt))
})

for (const [purpose, secret] of iter_secrets()) {
    add_secret_el(purpose, secret)
}

const last_checked = localStorage.getItem(CHECKED_ID_STORE)
let to_check = null
if (OPTIONS_CONT.childElementCount === 1 || last_checked === null) {
    to_check = OPTIONS_CONT.lastChild
} else {
    to_check = OPTIONS_CONT.children[parseInt(last_checked)]
}
check_purpose(to_check)

SALT_INP_EL.focus()