import index from './index';
import product from './product';
import account from './account';
import integral from './integral';
import order from './order';
import common from './common';

export default app =>{
    app.use('/index',index);
    app.use('/product',product);
    app.use('/account',account);
    app.use('/integral',integral);
    app.use('/order',order);
    app.use('/common',common);
}