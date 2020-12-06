import React, { Component } from "react";
import { render } from "react-dom";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./components"; 

const sliderStyle = {
  position: "relative",
  width: "100%"
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const YearSlider = ({firstDay, lastDay, className, onChange}) => {
    const dayCount = lastDay.getDaysSince(firstDay);
    const domain = [0,dayCount];
    const defaultValues = domain;

    const formatTick = (day) => {
        const tickDay = new Date(firstDay);
        tickDay.setDate( tickDay.getDate() + day);
        return months[tickDay.getMonth()] + " " + tickDay.getDate();
    }

    const handleChange = (values) => {
        const leftDay = new Date(firstDay);
        leftDay.setDate( leftDay.getDate() + values[0]);
        const rightDay = new Date(firstDay);
        rightDay.setDate( rightDay.getDate() + values[1]);
        onChange(leftDay, rightDay);
    }

    return <div className={className}>
        <Slider
            mode={2}
            step={1}
            domain={domain}
            rootStyle={sliderStyle}
            values={defaultValues}
            onChange={handleChange}
        >
        <Rail>
            {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
        </Rail>
        <Handles>
            {({ handles, getHandleProps }) => (
            <div className="slider-handles">
                {handles.map((handle) => (
                <Handle
                    key={handle.id}
                    handle={handle}
                    domain={domain}
                    getHandleProps={getHandleProps}
                />
                ))}
            </div>
            )}
        </Handles>
        <Tracks left={false} right={false}>
            {({ tracks, getTrackProps }) => (
            <div className="slider-tracks">
                {tracks.map(({ id, source, target }) => (
                <Track
                    key={id}
                    source={source}
                    target={target}
                    getTrackProps={getTrackProps}
                />
                ))}
            </div>
            )}
        </Tracks>
        <Ticks count={5}>
            {({ ticks }) => (
            <div className="slider-ticks">
                {ticks.map((tick) => (
                <Tick format={formatTick} key={tick.id} tick={tick} count={ticks.length} />
                ))}
            </div>
            )}
        </Ticks>
        </Slider>
    </div>
};

export default YearSlider;