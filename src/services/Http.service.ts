export const HttpService = {
    get: (url: string): Promise<any> => {
        return new Promise((res, rej) => {
            const req = new XMLHttpRequest();
            
            req.open('GET', url, true);
            req.setRequestHeader('Accept', 'application/json');
            req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status >= 200 && this.status <= 204) {
                        JSON.parse(this.response || {});
                    }
                    else rej(this.statusText);
                }
            };
            req.send();
        });
    },
    post: (url: string, body: any): Promise<void> => {

        return new Promise((res, rej) => {
            const req = new XMLHttpRequest();
            req.open('POST', url, true);
            req.setRequestHeader('Accept', 'application/json');
            req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status >= 200 && this.status <= 204) {
                        res();
                    }
                    else rej(this.statusText);
                }
            };
            req.send(JSON.stringify(body));
        });
    },
    put: (url: string, body: any): Promise<void> => {
        
        return new Promise((res, rej) => {
            const req = new XMLHttpRequest();
            req.open('PUT', url, true);
            req.setRequestHeader('Accept', 'application/json');
            req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status >= 200 && this.status <= 204) {
                        res();
                    }
                    else rej(this.statusText);
                }
            };
            req.send(JSON.stringify(body));
        });
    },
}