declare module 'react-slick' {
  import { Component } from 'react';
  
  export interface Settings {
    dots?: boolean;
    infinite?: boolean;
    speed?: number;
    slidesToShow?: number;
    slidesToScroll?: number;
    autoplay?: boolean;
    autoplaySpeed?: number;
    pauseOnHover?: boolean;
    responsive?: Array<{
      breakpoint: number;
      settings: Settings;
    }>;
    arrows?: boolean;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export default class Slider extends Component<Settings> {}
}
