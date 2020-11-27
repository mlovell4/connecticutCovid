export const Loading = ({children}) => {
    return <div className="loading">
        <div className="loadingIcon">
            <div className="circleGWrap">
                <div className="circleG circleG_1"></div>
                <div className="circleG circleG_2"></div>
                <div className="circleG circleG_3"></div>
            </div>
            {children}
        </div>
    </div>

}
