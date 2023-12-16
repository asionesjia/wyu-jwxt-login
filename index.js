import axios from "axios";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

class LoginToXk {
    constructor(xh, pwd) {
        this.account = xh;
        this.password = pwd;
        this.encoded = `${this.encodeInp(this.account)}%%%${this.encodeInp(this.password)}`
        this.imagePath = process.env.IMAGE_PATH
        this.baseUrl = process.env.BASE_URL
        this.aliCaptchaApiUrl = process.env.ALI_CAPTCHA_API_URL
        this.aliCaptchaAppCode = process.env.ALI_CAPTCHA_APPCODE
        this.bzb_jsxsd_cookie = ''
        this.JSESSIONID_cookie = ''
        this.SERVERID_cookie = ''
        this.cookies = () => {
            return [this.bzb_jsxsd_cookie, this.JSESSIONID_cookie, this.SERVERID_cookie]
        }
        this.jsonReqData = (captchaCode) =>{
            return {
                'loginMethod': 'LoginToXk',
                'userlanguage': 0,
                'userAccount': this.account,
                'userPassword': '',
                'RANDOMCODE': captchaCode,
                'encoded': this.encoded

            }
        }
    }

    login() {
        return this._loginInit().then(async () => {
            let loginStatus = await this._loginReq()
            if(!loginStatus) {
                loginStatus = await this._loginReq()
            }
            if(!loginStatus) {
                console.log('登录失败。')
                return {
                    'message': '登录失败。',
                    'loginStatus': loginStatus,
                    'this': this
                }
            }
            return {
                'message': '登录成功。',
                'loginStatus': loginStatus,
                'this': this
            }
        })
    }

    async _loginInit() {
        const initReq1 = await axios.get(`${this.baseUrl}/jsxsd`) // 拿到bzb_jsxsd
        this.bzb_jsxsd_cookie = initReq1.headers['set-cookie'][0].split(';')[0]
        const initReq2 = await axios.get(this.baseUrl, {
            headers: {
                Cookie: this.bzb_jsxsd_cookie
            }
        })  // 拿到JSESSIONID和SERVERID
        this.JSESSIONID_cookie = initReq2.headers['set-cookie'][0].split(';')[0]
        this.SERVERID_cookie = initReq2.headers['set-cookie'][1].split(';')[0]
    }

    async _loginReq() {
        this.loginRes = ''
        const captchaCode = await this._captchaCode()
        const formReqData = new URLSearchParams(this.jsonReqData(captchaCode)).toString();
        const loginRes = await axios.post(`${this.baseUrl}/jsxsd/xk/LoginToXk`, formReqData,
            {
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Content-Length': '148',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': this.cookies().join('; ')
                }
            })
        if(!loginRes.headers.get('set-cookie')) {
            this.loginRes = loginRes
            console.log('登录成功！')
            return true
        }
        this.bzb_jsxsd_cookie = loginRes.headers['set-cookie'][0].split(';')[0]
        this.SERVERID_cookie = loginRes.headers['set-cookie'][1].split(';')[0]
        return false
    }

    async _captchaCode () {
        const captchaReq = await axios.get(`${this.baseUrl}/jsxsd/verifycode.servlet?=${Math.random()}`, {
            headers: {
                'Cookie': this.cookies().join('; ')
            },
            responseType: 'arraybuffer'
        })
        await fs.writeFileSync(this.imagePath, captchaReq.data, 'binary');
        let code = '', i = 1
        while (!code && i < 3) {
            i = i + 1
            const codeRes = await this._recognizeCaptcha()
            if(codeRes) {
                code = codeRes
                break;
            }
        }
        return code
    }

    async _recognizeCaptcha() {
        try {
            const imageBase64 = fs.readFileSync(this.imagePath).toString('base64')
            const response = await axios.post(
                `${this.aliCaptchaApiUrl}?APPCODE=${this.aliCaptchaAppCode}`,
                `v_pic=${imageBase64}&pri_id=ne4`,
                {
                    headers:{
                        Authorization: `APPCODE ${this.aliCaptchaAppCode}`
                    }
                }
            )
            return response.data['v_code']
        } catch (error) {
            return false
        }
    }

    encodeInp(a) {
        let keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let output = "";
        let chr1, chr2, chr3 = "";
        let enc1, enc2, enc3, enc4 = "";
        let i = 0;

        do {
            chr1 = a.charCodeAt(i++);
            chr2 = a.charCodeAt(i++);
            chr3 = a.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < a.length);

        return output;
    }
}

const jwxt = new LoginToXk('20301111111', '8888888666666')
const res = jwxt.login()
console.log(res.then((res) => console.log(res)))
