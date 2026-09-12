import '../styles/index.css';
import { mountHeader, mountFooter } from '../ui/header.ts';
import { mountDrawer } from '../ui/cart-drawer.ts';
import { renderHome } from '../ui/home.ts';

mountHeader();
mountDrawer();
renderHome(document.getElementById('main')!);
mountFooter();
