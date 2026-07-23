import React from 'react'
import '../index.css'
import PlaceholderSVG from '../assets/placeholder.svg'

export default function PlaceholderUI(){
  return (
    <div className="app-root">
      <header className="app-header">
        <img src={PlaceholderSVG} alt="logo" className="logo" />
        <h1>Front-end UI Placeholder</h1>
        <p>Copy the folder <strong>D:\\MY PROGRAM FILES\\MINE\\NYUMBA DIRECT\\front_end</strong> into this workspace's <strong>front_end_recreated</strong> folder to replace this placeholder with the real UI.</p>
      </header>
    </div>
  )
}
