import { createBrowserRouter } from 'react-router';
import { SplashScreen } from './components/SplashScreen';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { LiveChat } from './components/LiveChat';
import { News } from './components/News';
import { Advertise } from './components/Advertise';
import { Contact } from './components/Contact';
import { VisitWebsite } from './components/VisitWebsite';

export const router = createBrowserRouter([
  { path: '/', Component: SplashScreen },
  {
    path: '/app',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'chat', Component: LiveChat },
      { path: 'news', Component: News },
      { path: 'advertise', Component: Advertise },
      { path: 'contact', Component: Contact },
      { path: 'website', Component: VisitWebsite },
    ],
  },
]);
