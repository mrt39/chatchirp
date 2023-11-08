/* eslint-disable react/prop-types */
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from 'react'
import * as Icon from 'react-bootstrap-icons';
import '../styles/Navbar.css'

const Navbar2 = () => {

    return (
      <>
      <div className="d-flex flex-column flex-shrink-0 bg-body-tertiary" style={{width: "4.5rem"}}>
      <a href="/" className="d-block p-3 link-body-emphasis text-decoration-none" title="Icon-only" data-bs-toggle="tooltip" data-bs-placement="right">
        <svg className="bi pe-none" width="40" height="32"><use xlinkHref="#bootstrap"/></svg>
        <span className="visually-hidden">Icon-only</span>
      </a>
      <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
        <li className="nav-item">
          <a href="#" className="nav-link active py-3 border-bottom rounded-0" aria-current="page" title="Home" data-bs-toggle="tooltip" data-bs-placement="right">
          <Icon.ArrowRight />          
          </a>
        </li>
        <li>
          <a href="#" className="nav-link py-3 border-bottom rounded-0" title="Dashboard" data-bs-toggle="tooltip" data-bs-placement="right">
            <svg className="bi pe-none" width="24" height="24" role="img" aria-label="Dashboard"><use xlinkHref="#speedometer2"/></svg>
            <Icon.Table />
          </a>
        </li>
        <li>
          <a href="#" className="nav-link py-3 border-bottom rounded-0" title="Orders" data-bs-toggle="tooltip" data-bs-placement="right">
            <svg className="bi pe-none" width="24" height="24" role="img" aria-label="Orders"><use xlinkHref="#table"/></svg>
          </a>
        </li>
        <li>
          <a href="#" className="nav-link py-3 border-bottom rounded-0" title="Products" data-bs-toggle="tooltip" data-bs-placement="right">
            <svg className="bi pe-none" width="24" height="24" role="img" aria-label="Products"><use xlinkHref="#grid"/></svg>
          </a>
        </li>
        <li>
          <a href="#" className="nav-link py-3 border-bottom rounded-0" title="Customers" data-bs-toggle="tooltip" data-bs-placement="right">
            <svg className="bi pe-none" width="24" height="24" role="img" aria-label="Customers"><use xlinkHref="#people-circle"/></svg>
          </a>
        </li>
      </ul>
      <div className="dropdown border-top">
        <a href="#" className="d-flex align-items-center justify-content-center p-3 link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          <img src="https://github.com/mdo.png" alt="mdo" width="24" height="24" className="rounded-circle"/>
        </a>
        <ul className="dropdown-menu text-small shadow">
          <li><a className="dropdown-item" href="#">New project...</a></li>
          <li><a className="dropdown-item" href="#">Settings</a></li>
          <li><a className="dropdown-item" href="#">Profile</a></li>
          <li></li>
          <li><a className="dropdown-item" href="#">Sign out</a></li>
        </ul>
      </div>
    </div>
{/*     <ColorModeButton/> */}
    </>
      );
    };
    
    
export default Navbar2;