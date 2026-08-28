import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
export interface TreeNode { id:string; label:string; children?:TreeNode[]; disabled?:boolean; }
interface VisibleTreeNode { node:TreeNode; level:number; expandable:boolean; }
@Component({selector:'orc-tree-view',standalone:true,templateUrl:'./tree-view.component.html',styleUrl:'./tree-view.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class TreeViewComponent {
  readonly nodes=input<TreeNode[]>([]); readonly label=input<string | undefined>(undefined); readonly collapseLabel=input<string | undefined>(undefined); readonly expandLabel=input<string | undefined>(undefined); readonly nodeSelect=output<TreeNode>(); readonly expanded=signal<ReadonlySet<string>>(new Set());
  readonly visibleNodes=computed(()=>{const result:VisibleTreeNode[]=[];const visit=(nodes:TreeNode[],level:number)=>nodes.forEach(node=>{const expandable=!!node.children?.length;result.push({node,level,expandable});if(expandable&&this.expanded().has(node.id))visit(node.children!,level+1);});visit(this.nodes(),1);return result;});
  toggle(node:TreeNode):void{if(!node.children?.length)return;this.expanded.update(current=>{const next=new Set(current);next.has(node.id)?next.delete(node.id):next.add(node.id);return next;});}
  activate(node:TreeNode):void{if(!node.disabled)this.nodeSelect.emit(node);}
  keydown(event:KeyboardEvent,item:VisibleTreeNode):void{if(event.key==='ArrowRight'&&item.expandable&&!this.expanded().has(item.node.id)){this.toggle(item.node);event.preventDefault();}else if(event.key==='ArrowLeft'&&this.expanded().has(item.node.id)){this.toggle(item.node);event.preventDefault();}else if(event.key==='Enter'||event.key===' '){this.activate(item.node);event.preventDefault();}}
}
