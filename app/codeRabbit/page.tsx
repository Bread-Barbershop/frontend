'use client';

import { useState, useEffect, useRef } from 'react';

const api_url = 'https://jsonplaceholder.typicode.com/todos';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  [key: string]: any; 
}

export default function BadPracticePage() {
  const [todos, setTodos] = useState<any>(null);
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  
  const titleRef = useRef<HTMLHeadingElement>(null);

  const heavyCalculationResult = (() => {
    let result = 0;
    for (let i = 0; i < 1000000000; i++) {
        result += Math.sin(i) * Math.cos(i);
    }
    return result.toFixed(2);
  })();

  useEffect(() => {
    fetch(api_url)
      .then((response) => response.json())
      .then((data) => {
        setTodos(data.slice(0, 20));
      })
  }, []);

  const handleDirectDOMManipulation = () => {
    if (titleRef.current) {
      titleRef.current.style.color = 'red';
      titleRef.current.innerText = 'DOM을 강제로 바꿨습니다!';
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 ref={titleRef}>엉망진창 테스트 페이지</h1>

      <div style={{ border: '2px solid red', padding: '10px', margin: '10px 0' }}>
        <h3>계산 결과:</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{heavyCalculationResult}</p>
      </div>

      <hr />

      <div>
        <h2>상태 변경 테스트</h2>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ padding: '10px', marginRight: '10px', cursor: 'pointer' }}
        >
          카운트 증가 (현재: {count})
        </button>

        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="타이핑 해보세요"
          style={{ padding: '10px' }}
        />

        <br /><br />
        <button onClick={handleDirectDOMManipulation}>
          제목 색상 강제 변경
        </button>
      </div>

      <hr />

      <h2>할 일 목록</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {todos && todos.map((todo: any, index: number) => (
          <li key={index} style={{ 
            padding: '10px', 
            borderBottom: '1px solid #ccc',
            backgroundColor: todo.completed ? (index % 2 === 0 ? '#e0ffe0' : '#d0ffd0') : 'white' 
          }}>
            <span>[{todo.completed}] </span> 
            <strong>{todo.title}</strong>
          </li>
        ))}
      </ul>

      <hr />

      <h2>HTML 렌더링 테스트</h2>
      <div 
        dangerouslySetInnerHTML={{ 
          __html: `
            <p>HTML 영역입니다.</p>
            <img src=x onerror="alert('XSS 스크립트 실행됨')" />
          ` 
        }}
        style={{ border: '2px solid orange', padding: '10px', background: '#fff5e6' }}
      />
    </div>
  );
}