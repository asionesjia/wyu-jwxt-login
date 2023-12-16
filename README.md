# 武夷学院-新教务系统模拟登录
武夷学院新教务系统选课模拟登录，纯js实现。

代码很容易理解，我不过多赘述。

```bash
npm install
```

用法示例：
```javascript
// 如何使用
const jwxt = new LoginToXk("20301111111", "8888888666666")
const res = jwxt.login()
console.log(res.then((res) => console.log(res)))
```

登录成功示例：
```json
{
    "message": "登录成功。", 
    "loginStatus": true,
    "this": LoginToXk {
        "account": "20301111111",
        "password": "8888888666666",
        "encoded": "8888888666666",
        "imagePath": "captcha.jpg",
        "baseUrl": "https://jwxt.wuyiu.edu.cn",
        "aliCaptchaApiUrl": "xxx",
        "aliCaptchaAppCode": "xxx",
        "bzb_jsxsd_cookie": "bzb_jsxsd=xxx",
        "JSESSIONID_cookie": "JSESSIONID=xxx",
        "SERVERID_cookie": "SERVERID=xxx",
        "cookies": [Function (anonymous)],
        "jsonReqData": [Function (anonymous)],
        "loginRes": {
            "status": 200,
            "statusText": "",
            "headers": [Object [AxiosHeaders]],
            "config": [Object],
            "request": [ClientRequest],
            "data": "登录成功后页面的document data"
        }
}

```
