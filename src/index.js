import React from 'react'
import ReactDOM from 'react-dom'
import MainContainer from './containers/MainContainer'

const wrapper = document.getElementById("main")
wrapper ? ReactDOM.render(<MainContainer />, wrapper) : false
