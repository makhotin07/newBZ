import re
from datetime import datetime
from typing import Any, Dict, List

from backend.apps.databases.models import DatabaseProperty


class FormulaEvaluator:
    """Класс для вычисления формул в свойствах базы данных"""
    
    @staticmethod
    def evaluate(expression: str, record_data: Dict[str, Any], properties: List[DatabaseProperty]) -> Any:
        """
        Вычисляет формулу для записи
        
        Args:
            expression: выражение формулы (например, "prop('field1') * prop('field2')")
            record_data: данные записи {property_id: value}
            properties: список свойств базы данных
            
        Returns:
            Результат вычисления формулы
        """
        try:
            # Создаем контекст для выполнения формулы
            context = FormulaEvaluator._create_context(record_data, properties)
            
            # Заменяем prop() функции на значения
            evaluated_expression = FormulaEvaluator._replace_prop_functions(expression, context)
            
            # Безопасное выполнение выражения
            result = FormulaEvaluator._safe_eval(evaluated_expression)
            
            return result
            
        except Exception as e:
            return f"Error: {str(e)}"
    
    @staticmethod
    def _create_context(record_data: Dict[str, Any], properties: List[DatabaseProperty]) -> Dict[str, Any]:
        """Создает контекст для выполнения формулы"""
        context = {}
        
        # Добавляем свойства по имени и ID
        for prop in properties:
            value = record_data.get(str(prop.id), '')
            
            # Конвертируем значения в нужные типы
            if prop.type == 'number':
                try:
                    value = float(value) if value else 0
                except (ValueError, TypeError):
                    value = 0
            elif prop.type == 'checkbox':
                value = bool(value)
            elif prop.type == 'date':
                if isinstance(value, str) and value:
                    try:
                        value = datetime.fromisoformat(value.replace('Z', '+00:00'))
                    except ValueError:
                        value = None
            
            context[prop.name] = value
            context[str(prop.id)] = value
        
        return context
    
    @staticmethod
    def _replace_prop_functions(expression: str, context: Dict[str, Any]) -> str:
        """Заменяет prop() функции на значения"""
        # Паттерн для поиска prop('name') или prop("name")
        pattern = r"prop\s*\(\s*['\"]([^'\"]+)['\"]\s*\)"
        
        def replace_prop(match):
            prop_name = match.group(1)
            value = context.get(prop_name, 0)
            
            # Возвращаем строковое представление значения
            if isinstance(value, str):
                return f"'{value}'"
            elif isinstance(value, bool):
                return str(value).lower()
            elif value is None:
                return '0'
            else:
                return str(value)
        
        return re.sub(pattern, replace_prop, expression)
    
    @staticmethod
    def _safe_eval(expression: str) -> Any:
        """Безопасное выполнение математического выражения"""
        # Разрешенные операторы и функции
        allowed_names = {
            '__builtins__': {},
            'abs': abs,
            'min': min,
            'max': max,
            'round': round,
            'sum': sum,
            'len': len,
            'str': str,
            'int': int,
            'float': float,
            'bool': bool,
        }
        
        # Безопасная оценка выражения
        return eval(expression, allowed_names)
