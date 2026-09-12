import '../styles/index.css';
import { mountHeader, mountFooter } from '../ui/header.ts';
import { mountDrawer } from '../ui/cart-drawer.ts';
import { mountPicker } from '../ui/picker.ts';
import { trackVisualViewport } from '../lib/util.ts';

mountHeader();
mountDrawer();
mountFooter();
mountPicker(document.getElementById('main')!);
trackVisualViewport();
