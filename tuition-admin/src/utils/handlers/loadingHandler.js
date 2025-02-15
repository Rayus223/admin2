import { message } from 'antd';

let loadingCount = 0;
let loadingMessage = null;

class LoadingHandler {
    static start(msg = 'Loading...') {
        loadingCount++;
        if (loadingCount === 1) {
            loadingMessage = message.loading(msg, 0);
        }
    }

    static stop() {
        loadingCount--;
        if (loadingCount === 0 && loadingMessage) {
            loadingMessage();
            loadingMessage = null;
        }
    }

    static reset() {
        loadingCount = 0;
        if (loadingMessage) {
            loadingMessage();
            loadingMessage = null;
        }
    }
}

export default LoadingHandler;