export const usePromise = (promise: Promise<any>) =>
  promise.then(data => [null, data]).catch(error => [error]);
