import '../styles/index.css';
import { mountHeader, mountFooter } from '../ui/header.ts';
import { mountDrawer } from '../ui/cart-drawer.ts';
import { renderCheckout } from '../ui/checkout.ts';

mountHeader();
mountDrawer();
renderCheckout(document.getElementById('main')!);
mountFooter();
