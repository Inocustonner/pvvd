import * as crypto from 'crypto-js'
import base from 'base-x'
import secureRandom from 'secure-random'
import copy from 'copy-to-clipboard'

import './styles.css'
import './icon128.png'

const STORE_KEY = '_backend_token'

const BASE_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz!\"#$%&'()*+,-.:;<=>?@[]^_`{|}~"
const SECRET_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
const based = base(BASE_ALPHABET)
const secret_based = base(SECRET_ALPHABET)

const gen_secret = () => secret_based.encode(secureRandom(64, { type: 'Uint8Array' }))
const set_secret = (secret) => localStorage.setItem(STORE_KEY, secret)
const load_secret = () => {
    let sec = localStorage.getItem(STORE_KEY)
    if (sec === null) {
        sec = gen_secret()
        set_secret(sec)
    }
    return sec
}

const unhuman_secret = () => new TextDecoder().decode(secret_based.decode(SECRET))

var SECRET = load_secret()

const hash = (msg, cut) => {
    const hashed = crypto.RIPEMD160(crypto.HmacSHA512(msg, unhuman_secret()).toString()).toString(crypto.enc.Hex)
    return based.encode(new TextEncoder().encode(hashed)).slice(2, cut + 2)
}

const SECRET_INP_EL = document.getElementById("secret")

document.getElementById("salt").addEventListener("input", e => {
    const salt = e.target.value
    if (salt !== "")
        copy(hash(salt, 14))
    // console.log(hash(salt, 14))
})
SECRET_INP_EL.addEventListener("input", e => {
    const secret = e.target.value
    localStorage.setItem(STORE_KEY, secret)
    SECRET = secret
})
document.getElementById("generate_secret").addEventListener("click", e => {
    set_secret(gen_secret())
    SECRET = load_secret()
    SECRET_INP_EL.value = SECRET
})
SECRET_INP_EL.value = SECRET