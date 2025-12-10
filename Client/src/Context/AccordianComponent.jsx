import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
} from "react";
import { FaChevronDown } from "react-icons/fa"; 

const AccordionContext = createContext();

export default function Accordion({ children, value, onChange, ...props }) {
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    if (onChange) onChange(selected);
  }, [selected, onChange]);

  return (
    <ul {...props}>
      <AccordionContext.Provider value={{ selected, setSelected }}>
        {children}
      </AccordionContext.Provider>
    </ul>
  );
}

export function AccordionItem({ children, value, trigger, ...props }) {
  const { selected, setSelected } = useContext(AccordionContext);
  const open = selected === value;
  const ref = useRef(null);

  return (
    <li className=" bg-gray-100 rounded-xl" {...props}>
      <header
        role="button"
        onClick={() => setSelected(open ? null : value)}
        className="flex justify-between items-center p-4 font-medium"
      >
        {trigger}
        <FaChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </header>
      <div
        className="overflow-hidden transition-all"
        style={{ height: open ? ref.current?.offsetHeight || 0 : 0 }}
      >
        <div className="pt-2 p-4" ref={ref}>
          {children}
        </div>
      </div>
    </li>
  );
}