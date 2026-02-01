import React from 'react'

export interface FooProps {
  /**
   * Additional custom classes
   */
  className?: string;
}

function Foo({ className }: FooProps) {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <p className="text-gray-500">This is a basic Foo component example.</p>
    </div>
  )
}

export default Foo