import React from 'react';
import { FuriganaSegment } from '../types';

interface RubyTextProps {
  segments: FuriganaSegment[];
}

const RubyText: React.FC<RubyTextProps> = ({ segments }) => {
  return (
    <div className="flex flex-nowrap items-end justify-center whitespace-nowrap">
      {segments.map((seg, idx) => {
        if (seg.furigana) {
          return (
            <ruby key={idx} className="flex flex-col items-center mx-[1px]">
              <span className="text-lg md:text-xl font-bold leading-none">{seg.text}</span>
              <rt className="text-[10px] md:text-xs text-gray-600 font-normal leading-none mb-1 select-none">
                {seg.furigana}
              </rt>
            </ruby>
          );
        }
        return (
          <span key={idx} className="text-lg md:text-xl font-bold leading-none mx-[1px] py-[1px] mb-[15px] md:mb-[17px]">
            {seg.text}
          </span>
        );
      })}
    </div>
  );
};

export default RubyText;