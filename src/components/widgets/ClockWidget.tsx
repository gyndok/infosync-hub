import WidgetContainer from './WidgetContainer';

export const ClockWidget = () => {
  return (
    <WidgetContainer title="World Clock" className="h-auto">
      <div className="flex items-center justify-center p-4">
        <iframe 
          src="https://free.timeanddate.com/clock/ia2f5huc/n104/fn6/fs16/fc9ff/tc000/ftb/bas2/bat1/bacfff/pa8/tt0/tw1/th1/ta1/tb4" 
          frameBorder="0" 
          width="212" 
          height="56"
          className="rounded border-0"
          title="World Clock"
        />
      </div>
    </WidgetContainer>
  );
};