
import { Route, useHistory } from 'react-router-dom';

const Navbar = ({pageName}) => {
    const history = useHistory();

    pageName = pageName || "Covid19"

    const showState = (e) => {
        e.preventDefault();
        history.push("/");
    }

    const showUS = (e) => {
        e.preventDefault();
        history.push("/us");
    }

    const showTowns = (e) => {
        e.preventDefault();
        history.push("/towns")
    }

    const showTownDetails = (e) => {
        e.preventDefault();
        history.push("/towns-details");
    }

    const showTownsMap = (e) => {
        e.preventDefault();
        history.push("/towns-map");
    }

    return (
    <nav className="navbar navbar-expand-md navbar-dark">
        <span className="navbar-brand mb-0 h1 d-block d-md-none">{pageName}</span>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse  justify-content-center" id="navbarNav">
            <ul className="navbar-nav">
                <Route render={
                        (location)=>{
                            let pathname = location.location.pathname;
                            return <>
                                <li className={'nav-item ' + (pathname === '/' ? 'active' : '')}>
                                    <button className="nav-link link" onClick={showState} href="./#" data-toggle="collapse" data-target=".navbar-collapse.show"><i className="fa fa-line-chart"/> State{pathname !== "/" && <span className="sr-only">(current)</span>}</button>
                                </li>
                                <li className={'nav-item ' + (pathname === '/towns-map' ? 'active' : '')}>
                                    <button className="nav-link link" onClick={showTownsMap} href="./#" data-toggle="collapse" data-target=".navbar-collapse.show"><i className="fa fa-map-o"/> CT Map{pathname !== "/towns-map" && <span className="sr-only">(current)</span>}</button>
                                </li>
                                <li className={'nav-item ' + (pathname === '/towns' ? 'active' : '')}>
                                    <button className="nav-link link" onClick={showTowns} href="./#" data-toggle="collapse" data-target=".navbar-collapse.show"><i className="fa fa-list"/> Towns List{pathname !== "/towns" && <span className="sr-only">(current)</span>}</button>
                                </li>
                                <li className={'nav-item ' + (pathname === '/towns-details' ? 'active' : '')}>
                                    <button className="nav-link link" onClick={showTownDetails} href="./#" data-toggle="collapse" data-target=".navbar-collapse.show"><i className="fa fa-table"/> Town Detail Table{pathname !== "/towns-details" && <span className="sr-only">(current)</span>}</button>
                                </li>
                                {/* <li className={'nav-item ' + (pathname === '/us' ? 'active' : '')}>
                                    <button className="nav-link link" onClick={showUS} href="./#" data-toggle="collapse" data-target=".navbar-collapse.show"><i className="fa fa-area-chart"/> US Data{pathname !== "/us" && <span className="sr-only">(current)</span>}</button>
                                </li> */}
                            </>    
                        }
                    } />
            </ul>
        </div>
    </nav>)

}


export default Navbar;