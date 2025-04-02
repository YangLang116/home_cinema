import { useEffect, useRef, RefObject } from 'react';

interface UseIntersectionObserverProps {
  target: RefObject<HTMLElement | HTMLDivElement>;
  onIntersect: () => void;
  enabled?: boolean;
  rootMargin?: string;
  threshold?: number;
  root?: Element | null;
}

/**
 * 自定义钩子用于监测元素是否进入视口
 * 
 * @param target 需要监视的目标元素引用
 * @param onIntersect 元素进入视口时触发的回调函数
 * @param enabled 是否启用观察器
 * @param rootMargin 根元素的边距，格式与 CSS 中的 margin 属性相同
 * @param threshold 目标元素可见比例触发阈值
 * @param root 观察的根元素，默认为浏览器视口
 */
export const useIntersectionObserver = ({
  target,
  onIntersect,
  enabled = true,
  rootMargin = '200px 0px',
  threshold = 0.1,
  root = null,
}: UseIntersectionObserverProps) => {
  // 保存上一次的回调函数引用
  const savedCallback = useRef(onIntersect);
  
  // 保存IntersectionObserver实例
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // 节流触发标志，防止短时间内多次触发
  const isIntersectingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 当回调函数变化时更新引用
  useEffect(() => {
    savedCallback.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    // 清理之前的observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // 如果不启用，则不创建observer
    if (!enabled) {
      return;
    }
    
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      // 如果元素在视口内
      if (entry.isIntersecting) {
        // 如果不在节流状态，则可以触发回调
        if (!isIntersectingRef.current) {
          isIntersectingRef.current = true;
          
          // 清理之前的timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          // 触发回调
          savedCallback.current();
          
          // 设置短暂延时，防止重复触发
          timeoutRef.current = setTimeout(() => {
            isIntersectingRef.current = false;
          }, 100);
        }
      } else {
        // 元素离开视口时，重置节流状态，使下次进入视口时能立即触发
        isIntersectingRef.current = false;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };
    
    observerRef.current = new IntersectionObserver(
      handleIntersection,
      {
        root,
        rootMargin,
        threshold,
      }
    );

    const currentTarget = target.current;

    if (currentTarget) {
      observerRef.current.observe(currentTarget);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [target, enabled, rootMargin, threshold, root]);
}; 