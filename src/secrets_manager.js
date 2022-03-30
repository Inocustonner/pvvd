import * as crypto from 'crypto-js'
import base from 'base-x'
import secureRandom from 'secure-random'

export const DEFAULT_CUT = 18

const STORE_KEY = '_backend_token'

const BASE_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz!\"#$%&'()*+,-.:;<=>?@[]^_`{|}~"
const SECRET_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
const based = base(BASE_ALPHABET)
const secret_based = base(SECRET_ALPHABET)

const gen_secret = () => secret_based.encode(secureRandom(64, { type: 'Uint8Array' }))
const hash_purpose = (puspose) => crypto.HmacRIPEMD160(puspose, SECRET_ALPHABET)

const load_secrets = () => {
    let purposes = JSON.parse(localStorage.getItem(STORE_KEY) || "[]")
    if (!(purposes instanceof Array)) {
        purposes = []
    } 
    const secrets = new Map()
    purposes.forEach(purpose => {
        secrets.set(purpose, localStorage.getItem(hash_purpose(purpose)))
    });
    return secrets
}

export const set_secret = (purpose, secret) => {
    secrets.set(purpose, secret)
    localStorage.setItem(hash_purpose(purpose), secret)
    localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(secrets.keys())))
    return secret
}

export const create_secret = (purpose) => {
    const secret = gen_secret()
    set_cut(purpose, DEFAULT_CUT)
    return set_secret(purpose, secret)
}

export const remove_secret = (purpose) => {
    secrets.delete(purpose)
    localStorage.removeItem(hash_purpose(purpose))
    localStorage.setItem(STORE_KEY, JSON.stringify(secrets.keys()))

    remove_cut(purpose)
}

export const get_cut = (purpose) => parseInt(localStorage.getItem(hash_purpose(`cut_${purpose}`))) || DEFAULT_CUT
export const set_cut = (purpose, cut) => localStorage.setItem(hash_purpose(`cut_${purpose}`), cut)
export const remove_cut = (purpose) => localStorage.removeItem(hash_purpose(`cut_${purpose}`))

const unhuman_secret = (purpose) => new TextDecoder().decode(secret_based.decode(secrets.get(purpose)))

const secrets = load_secrets()

export const iter_secrets = () => secrets.entries()

export const hash = (purpose, msg) => {
    let cut = get_cut(purpose)
    const hashed = crypto.RIPEMD160(crypto.HmacSHA512(msg, unhuman_secret(purpose)).toString()).toString(crypto.enc.Hex)
    return based.encode(new TextEncoder().encode(hashed)).slice(2, cut + 2)
}