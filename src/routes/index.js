import Routes from './Constants';
import HomeView from '../views/Home'
import SymbolsView from '../views/Symbols'
import DetailedView from '../views/Detailed'
export default [
    {
        path : '/',
        name : Routes.HOME,
        component : HomeView,
        meta : {
            title : 'Home'
        },
    },
    {
        path : '/symbols',
        name : Routes.SYMBOLS,
        component : SymbolsView,
        meta : {
            title : 'Symbols'
        },
    },
    {
        path : '/detailed',
        name : Routes.DETAILED,
        component : DetailedView,
        meta : {
            title : 'Detailed'
        },
    },
];
